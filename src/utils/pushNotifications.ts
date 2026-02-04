import { supabase } from '@/integrations/supabase/client';

// VAPID public key - set this in your .env file
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Convert VAPID key to Uint8Array for subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Get previous month name in Spanish
function getPreviousMonthName(): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  return months[previousMonth];
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.log('VAPID public key not configured');
    return false;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Subscribe to push notifications
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    // Extract subscription data
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscriptionJson.endpoint!;
    const keys = subscriptionJson.keys!;

    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint,
          keys_p256dh: keys.p256dh,
          keys_auth: keys.auth,
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('Error saving subscription:', error);
      return false;
    }

    console.log('Push subscription saved successfully');
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);

      // Unsubscribe locally
      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
}

export async function sendPushNotificationToAll(message?: string): Promise<{ success: boolean; sent?: number; failed?: number; total?: number }> {
  try {
    const previousMonth = getPreviousMonthName();
    const notificationMessage = message || `¡Recuerda enviar tu informe de servicio de ${previousMonth}! - Congregación Arrayanes`;

    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: { message: notificationMessage },
    });

    if (error) {
      console.error('Error sending push notifications:', error);
      return { success: false };
    }

    return {
      success: true,
      sent: data.sent,
      failed: data.failed,
      total: data.total,
    };
  } catch (error) {
    console.error('Error calling push notification function:', error);
    return { success: false };
  }
}

export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;
}

export async function getPushSubscriptionStatus(): Promise<'subscribed' | 'not-subscribed' | 'unsupported'> {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? 'subscribed' : 'not-subscribed';
  } catch {
    return 'unsupported';
  }
}
