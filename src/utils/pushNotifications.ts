import { supabase } from '@/integrations/supabase/client';
import { getPreviousMonth, getPreviousMonthYear } from '@/types/report';

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

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  console.log('=== Iniciando suscripción push ===');

  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker no soportado');
    return false;
  }

  if (!('PushManager' in window)) {
    console.error('❌ PushManager no soportado');
    return false;
  }

  console.log('VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY ? `${VAPID_PUBLIC_KEY.substring(0, 20)}...` : 'NO CONFIGURADA');

  if (!VAPID_PUBLIC_KEY) {
    console.error('❌ VAPID public key no configurada. Agrega VITE_VAPID_PUBLIC_KEY a tus variables de entorno.');
    return false;
  }

  try {
    // Register service worker
    console.log('📝 Registrando Service Worker...');
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service Worker registrado:', registration.scope);

    await navigator.serviceWorker.ready;
    console.log('✅ Service Worker listo');

    // Request notification permission only when needed
    if (Notification.permission === 'default') {
      console.log('🔔 Solicitando permiso de notificaciones...');
      const permission = await Notification.requestPermission();
      console.log('Permiso:', permission);
    }

    if (Notification.permission !== 'granted') {
      console.error('❌ Permiso de notificaciones denegado');
      return false;
    }

    // Reutilizar suscripción existente si ya existe
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('📲 Creando nueva suscripción push...');
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log('✅ Suscripción creada');
    } else {
      console.log('ℹ️ Ya existe suscripción local, reutilizando...');
    }

    // Extract subscription data
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscriptionJson.endpoint;
    const keys = subscriptionJson.keys;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      console.error('❌ Suscripción inválida: faltan endpoint/keys');
      return false;
    }

    console.log('📤 Guardando en base de datos...');
    console.log('Endpoint:', endpoint.substring(0, 50) + '...');

    // Save subscription to database
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
      });

    if (error) {
      // Si ya existe, consideramos éxito
      if (error.code === '23505') {
        console.log('ℹ️ La suscripción ya existía en la base de datos');
      } else {
        console.error('❌ Error guardando suscripción:', error);
        return false;
      }
    }

    console.log('✅ Suscripción push guardada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en suscripción push:', error);
    return false;
  }
}

export async function markCurrentSubscriptionAsReported(params: {
  fullName: string;
  month: string;
  year: number;
}): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    const sub = subscription.toJSON();
    const endpoint = sub.endpoint;
    const keys = sub.keys;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return false;
    }

    const cleanName = params.fullName.trim();
    const normalizedName = normalizeName(cleanName);

    // Reemplazar por endpoint (delete + insert) para evitar dependencia de policy UPDATE
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);

    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        subscriber_name: cleanName,
        subscriber_name_norm: normalizedName,
        last_report_month: params.month,
        last_report_year: params.year,
      } as any);

    if (error) {
      console.error('Error marcando suscripción como reporte enviado:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en markCurrentSubscriptionAsReported:', error);
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

export async function sendPushNotificationToAll(message?: string): Promise<{ success: boolean; sent?: number; failed?: number; total?: number; skipped?: number }> {
  try {
    // 1. Verificar si hay una sesión activa antes de intentar enviar
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('ERROR: No hay sesión activa. Debes iniciar sesión para enviar notificaciones.');
      return { success: false };
    }

    console.log('Enviando notificación como usuario:', session.user.email);

    // El recordatorio siempre corresponde al reporte del mes anterior
    const targetMonth = getPreviousMonth();
    const targetYear = getPreviousMonthYear();
    const notificationMessage = message || `¡Recuerda enviar tu informe de servicio de ${targetMonth.toLowerCase()}! - Congregación Arrayanes`;

    // 2. Invocar la función
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        message: notificationMessage,
        targetMonth,
        targetYear,
      },
    });

    if (error) {
      console.error('Error sending push notifications:', error);
      return { success: false };
    }

    console.log('Respuesta del servidor:', data);

    return {
      success: true,
      sent: data.sent,
      failed: data.failed,
      total: data.total,
      skipped: data.skipped,
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
