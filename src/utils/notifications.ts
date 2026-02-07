import { supabase } from '@/integrations/supabase/client';

// Get previous month name in Spanish (the month reports are due for)
function getPreviousMonthNameAndYear(baseDate = new Date()): { month: string; year: number } {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  const currentMonth = baseDate.getMonth();
  const currentYear = baseDate.getFullYear();

  if (currentMonth === 0) {
    return { month: months[11], year: currentYear - 1 };
  }

  return { month: months[currentMonth - 1], year: currentYear };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

export function scheduleLocalNotification() {
  const lastNotified = localStorage.getItem('lastNotificationDate');
  const today = new Date().toDateString();

  if (lastNotified === today) return;

  const dayOfMonth = new Date().getDate();
  if (dayOfMonth <= 7 && Notification.permission === 'granted') {
    const { month: previousMonth } = getPreviousMonthNameAndYear();
    const notification = new Notification('Recordatorio de Informe - Congregación Arrayanes', {
      body: `¡No olvides enviar tu informe de servicio de ${previousMonth}!`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'informe-reminder',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    localStorage.setItem('lastNotificationDate', today);
  }
}

export type BroadcastResult = {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  skipped?: number;
  mode: 'push' | 'local' | 'none';
  error?: string;
};

/**
 * Envia recordatorio push global por Edge Function.
 * Si falla (o no hay sesión), hace fallback local al admin actual.
 */
export async function sendBroadcastNotification(message: string): Promise<BroadcastResult> {
  const { month: targetMonth, year: targetYear } = getPreviousMonthNameAndYear();

  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        message,
        targetMonth,
        targetYear,
      },
    });

    if (error) {
      console.error('send-push-notification invoke error:', error);
      // fallback local
      if (Notification.permission === 'granted') {
        new Notification('Congregación Arrayanes', {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'admin-notification-local-fallback',
        });
        return { success: true, sent: 1, failed: 0, total: 1, mode: 'local', error: error.message };
      }
      return { success: false, sent: 0, failed: 0, total: 0, mode: 'none', error: error.message };
    }

    // Expected response from edge fn
    const sent = Number((data as any)?.sent ?? 0);
    const failed = Number((data as any)?.failed ?? 0);
    const total = Number((data as any)?.total ?? sent + failed);
    const skipped = Number((data as any)?.skipped ?? 0);
    const success = Boolean((data as any)?.success ?? true);

    return {
      success,
      sent,
      failed,
      total,
      skipped,
      mode: 'push',
    };
  } catch (err: any) {
    console.error('sendBroadcastNotification fatal:', err);

    if (Notification.permission === 'granted') {
      new Notification('Congregación Arrayanes', {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'admin-notification-local-fallback',
      });
      return {
        success: true,
        sent: 1,
        failed: 0,
        total: 1,
        mode: 'local',
        error: err?.message,
      };
    }

    return {
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      mode: 'none',
      error: err?.message || 'Unknown error',
    };
  }
}

export async function setupNotifications() {
  const hasPermission = await requestNotificationPermission();

  if (hasPermission) {
    await registerServiceWorker();
    scheduleLocalNotification();
    setInterval(scheduleLocalNotification, 24 * 60 * 60 * 1000);
  }

  return hasPermission;
}

export function checkNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
