import { supabase } from '@/integrations/supabase/client';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

let currentSubscription: PushSubscriptionData | null = null;
let currentUserEmail: string | null = null;

const monthKey = (month: string, year: number) => `${year}-${month.toLowerCase()}`;
const submittedCacheKey = (email: string, month: string, year: number) =>
  `report-submitted:${email}:${monthKey(month, year)}`;

const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase() || null;
const normalizeMonth = (m: string | null | undefined) => (m || '').trim().toLowerCase();

const getSafeCurrentUserEmail = async (): Promise<string | null> => {
  if (currentUserEmail) return currentUserEmail;

  try {
    const { data } = await supabase.auth.getUser();
    const email = normalizeEmail(data?.user?.email ?? null);
    if (email) currentUserEmail = email;
    return email;
  } catch {
    return null;
  }
};

// ---- Public helpers used by Index.tsx ----
export const setCurrentUser = (email: string | null) => {
  currentUserEmail = normalizeEmail(email);
};

export const clearCurrentUser = () => {
  currentUserEmail = null;
};

export const shouldShowReminderForMonth = async (month: string, year: number): Promise<boolean> => {
  const email = await getSafeCurrentUserEmail();
  const monthNorm = normalizeMonth(month);
  if (!email) return true;

  // Fast local cache to avoid flicker after submit
  try {
    if (localStorage.getItem(submittedCacheKey(email, monthNorm, year)) === '1') return false;
  } catch {
    // ignore storage errors
  }

  // Prefer user_email/is_active if schema has it. If not available, fail-open.
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('last_report_month,last_report_year,user_email,is_active')
    .eq('user_email', email)
    .eq('is_active', true);

  if (error) {
    console.warn('shouldShowReminderForMonth fallback (schema/policy):', error.message);
    return true;
  }

  const alreadyReported = (data ?? []).some(
    (row: any) => normalizeMonth(row?.last_report_month) === monthNorm && Number(row?.last_report_year) === year,
  );

  if (alreadyReported) {
    try {
      localStorage.setItem(submittedCacheKey(email, monthNorm, year), '1');
    } catch {
      // ignore storage errors
    }
    return false;
  }

  return true;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const getVapidPublicKey = async (): Promise<string | null> => {
  // Preferred: frontend env
  const envKey = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  // Optional fallback function
  const { data, error } = await supabase.functions.invoke('get-vapid-public-key');

  if (error || !data?.publicKey) {
    console.error('Failed to get VAPID public key:', error);
    return null;
  }

  return data.publicKey;
};


export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js');
  }
  await navigator.serviceWorker.ready;
  return registration;
}

export const subscribeToPushNotifications = async (name = 'Usuario'): Promise<boolean> => {
  try {
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      alert('Permiso de notificaciones denegado');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      alert('Tu navegador no soporta Service Workers');
      return false;
    }

    const registration = await getOrRegisterServiceWorker();

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        alert('No se pudo obtener la clave de notificaciones');
        return false;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const subscriptionData = subscription.toJSON();
    if (!subscriptionData.endpoint || !subscriptionData.keys?.p256dh || !subscriptionData.keys?.auth) {
      alert('Datos de suscripción incompletos');
      return false;
    }

    const userEmail = await getSafeCurrentUserEmail();

    const payload: any = {
      endpoint: subscriptionData.endpoint,
      keys_p256dh: subscriptionData.keys.p256dh,
      keys_auth: subscriptionData.keys.auth,
      subscriber_name: name,
      subscriber_name_norm: name.trim().toLowerCase(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    if (userEmail) payload.user_email = userEmail;

    const { error } = await supabase.from('push_subscriptions').upsert(payload, {
      onConflict: 'endpoint',
    });

    if (error) {
      // fallback minimal schema
      const { error: fallbackError } = await supabase.from('push_subscriptions').upsert(
        {
          endpoint: subscriptionData.endpoint,
          keys_p256dh: subscriptionData.keys.p256dh,
          keys_auth: subscriptionData.keys.auth,
        },
        { onConflict: 'endpoint' },
      );

      if (fallbackError) {
        console.error('Failed to save subscription:', fallbackError);
        alert('Error al guardar suscripción');
        return false;
      }
    }

    currentSubscription = {
      endpoint: subscriptionData.endpoint,
      keys: {
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
      },
    };

    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await getOrRegisterServiceWorker();
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;

      await subscription.unsubscribe();

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() } as any)
        .eq('endpoint', endpoint);

      if (error) {
        // older schema fallback
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
    }

    currentSubscription = null;
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

export const getCurrentSubscriptionStatus = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await getOrRegisterServiceWorker();
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return false;

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('is_active')
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    if (!error && data) {
      return (data as any).is_active ?? true;
    }

    // fallback when `is_active` doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('push_subscriptions')
      .select('endpoint')
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    return !fallbackError && !!fallbackData;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const triggerTestNotification = async (): Promise<boolean> => {
  try {
    const registration = await getOrRegisterServiceWorker();
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      alert('No hay suscripción activa');
      return false;
    }

    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        testMode: true,
        endpoint: subscription.endpoint,
      },
    });

    if (error) {
      console.error('Failed to send test notification:', error);
      alert('Error al enviar notificación de prueba');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error triggering test notification:', error);
    return false;
  }
};

export const markCurrentSubscriptionAsReported = async (
  month: string,
  year: number,
  fullName?: string,
): Promise<boolean> => {
  try {
    const userEmail = await getSafeCurrentUserEmail();
    const monthNorm = normalizeMonth(month);

    // 1) Find all active subscriptions for current user.
    //    If we don't have email, fall back to current endpoint only.
    let subscriptions: any[] = [];

    if (userEmail) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_email', userEmail);

      if (error) {
        console.warn('Could not read subscriptions by user_email:', error.message);
      }

      subscriptions = data ?? [];
    }

    if (!subscriptions.length && currentSubscription?.endpoint) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('endpoint', currentSubscription.endpoint)
        .limit(1);

      subscriptions = data ?? [];
    }

    if (!subscriptions.length) {
      // Still keep local cache so reminder disappears for this browser.
      if (userEmail) {
        try {
          localStorage.setItem(submittedCacheKey(userEmail, monthNorm, year), '1');
        } catch {
          // ignore storage errors
        }
      }
      return true;
    }

    const now = new Date().toISOString();

    for (const sub of subscriptions) {
      const displayName = fullName || sub.subscriber_name || 'Usuario';

      const payload: any = {
        endpoint: sub.endpoint,
        keys_p256dh: sub.keys_p256dh,
        keys_auth: sub.keys_auth,
        subscriber_name: displayName,
        subscriber_name_norm: displayName.trim().toLowerCase(),
        last_report_month: monthNorm,
        last_report_year: year,
        is_active: true,
        updated_at: now,
        last_report_updated_at: now,
      };
      if (userEmail || sub.user_email) payload.user_email = userEmail || sub.user_email;

      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert(payload, { onConflict: 'endpoint' });

      if (upsertError) {
        // fallback to older schema
        const { error: fallbackError } = await supabase
          .from('push_subscriptions')
          .upsert(
            {
              endpoint: sub.endpoint,
              keys_p256dh: sub.keys_p256dh,
              keys_auth: sub.keys_auth,
              subscriber_name: displayName,
              subscriber_name_norm: displayName.trim().toLowerCase(),
              last_report_month: monthNorm,
              last_report_year: year,
            } as any,
            { onConflict: 'endpoint' },
          );

        if (fallbackError) {
          console.error('Failed to reinsert marked subscription:', fallbackError);
          return false;
        }
      }
    }

    if (userEmail) {
      try {
        localStorage.setItem(submittedCacheKey(userEmail, monthNorm, year), '1');
      } catch {
        // ignore storage errors
      }
    }

    return true;
  } catch (error) {
    console.error('Error marking subscription as reported:', error);
    return false;
  }
};

export const sendReportReminder = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification');

    if (error) {
      console.error('Failed to send reminder notifications:', error);
      return false;
    }

    console.log('Reminder notifications sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending reminder notifications:', error);
    return false;
  }
};


// --- Backward-compat exports for existing UI imports ---
export const isPushNotificationSupported = isPushSupported;

export const getPushSubscriptionStatus = async () => {
  return getCurrentSubscriptionStatus();
};
