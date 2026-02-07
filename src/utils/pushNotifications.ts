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
export const setCurrentUser = (email: string) => {
  currentUserEmail = normalizeEmail(email);
};

export const clearCurrentUser = () => {
  currentUserEmail = null;
};

export const shouldShowReminderForMonth = async (month: string, year: number): Promise<boolean> => {
  const email = await getSafeCurrentUserEmail();
  if (!email) return true;

  // Fast local cache to avoid flicker after submit
  try {
    if (localStorage.getItem(submittedCacheKey(email, month, year)) === '1') return false;
  } catch {
    // ignore storage errors
  }

  // If any active subscription for this user is already marked for this month/year,
  // do not show reminder (and also suppress pushes in edge function).
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('last_report_month,last_report_year')
    .eq('is_active', true)
    .eq('user_email', email);

  if (error) {
    // If schema isn't migrated yet, fail-open (show reminder).
    console.warn('shouldShowReminderForMonth fallback (schema/policy):', error.message);
    return true;
  }

  const alreadyReported = (data ?? []).some(
    (row: any) => row?.last_report_month === month && Number(row?.last_report_year) === year,
  );

  if (alreadyReported) {
    try {
      localStorage.setItem(submittedCacheKey(email, month, year), '1');
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

    const registration = await navigator.serviceWorker.ready;

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

    const payload = {
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth,
      name,
      user_email: userEmail,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('push_subscriptions').upsert(payload, {
      onConflict: 'endpoint',
    });

    if (error) {
      console.error('Failed to save subscription:', error);
      alert('Error al guardar suscripción');
      return false;
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

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;

      await subscription.unsubscribe();

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('endpoint', endpoint);

      if (error) {
        console.error('Failed to deactivate subscription in DB:', error);
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

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return false;

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('is_active')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (error || !data) return false;

    return data.is_active;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const triggerTestNotification = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
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

    // 1) Find all active subscriptions for current user.
    //    If we don't have email, fall back to current endpoint only.
    let subscriptions: any[] = [];

    if (userEmail) {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('is_active', true)
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
        .eq('is_active', true)
        .eq('endpoint', currentSubscription.endpoint)
        .limit(1);

      subscriptions = data ?? [];
    }

    if (!subscriptions.length) {
      // Still keep local cache so reminder disappears for this browser.
      if (userEmail) {
        try {
          localStorage.setItem(submittedCacheKey(userEmail, month, year), '1');
        } catch {
          // ignore storage errors
        }
      }
      return true;
    }

    const now = new Date().toISOString();

    for (const sub of subscriptions) {
      const payload = {
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        name: fullName || sub.name || 'Usuario',
        user_email: userEmail || sub.user_email || null,
        is_active: true,
        last_report_month: month,
        last_report_year: year,
        last_report_updated_at: now,
        updated_at: now,
      };

      // No UPDATE policy in this project: delete + insert pattern.
      const { error: delErr } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', sub.endpoint);

      if (delErr) {
        console.error('Failed deleting subscription before insert:', delErr);
      }

      const { error: insErr } = await supabase.from('push_subscriptions').insert(payload);
      if (insErr) {
        console.error('Failed to reinsert marked subscription:', insErr);
        return false;
      }
    }

    if (userEmail) {
      try {
        localStorage.setItem(submittedCacheKey(userEmail, month, year), '1');
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
