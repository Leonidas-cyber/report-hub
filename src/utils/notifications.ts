import { supabase } from '@/integrations/supabase/client';

// VAPID public key would need to be set up for production
// For now, we'll use localStorage-based notifications as a fallback

// Get previous month name in Spanish (the month reports are due for)
function getPreviousMonthName(): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  return months[previousMonth];
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
  // Store the last notification date
  const lastNotified = localStorage.getItem('lastNotificationDate');
  const today = new Date().toDateString();
  
  // Check if we already notified today
  if (lastNotified === today) {
    return;
  }

  // Check if it's the first week of the month (reminder time)
  const dayOfMonth = new Date().getDate();
  if (dayOfMonth <= 7) {
    // Show a notification reminder with previous month (the one reports are due for)
    if (Notification.permission === 'granted') {
      const previousMonth = getPreviousMonthName();
      const notification = new Notification('Recordatorio de Informe - Congregación Arrayanes', {
        body: `¡No olvides enviar tu informe de servicio de ${previousMonth}!`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'informe-reminder'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      localStorage.setItem('lastNotificationDate', today);
    }
  }
}

// Send notification to all registered users (called from admin panel)
export async function sendBroadcastNotification(message: string): Promise<boolean> {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Congregación Arrayanes', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'admin-notification'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return true;
  }
  return false;
}

export async function setupNotifications() {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    await registerServiceWorker();
    scheduleLocalNotification();
    
    // Set up interval to check daily
    setInterval(scheduleLocalNotification, 24 * 60 * 60 * 1000);
  }

  return hasPermission;
}

export function checkNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}
