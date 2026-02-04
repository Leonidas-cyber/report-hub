// Service Worker for Push Notifications
const CACHE_NAME = 'informes-servicio-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  // Soporta payload JSON (recomendado) o texto plano
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data?.text?.() };
  }

  const title = data.title || 'Recordatorio de Informe';
  const body =
    data.body ||
    data.message ||
    '¡No olvides enviar tu informe de servicio del mes!';

  const url = data.url || '/';

  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url
    },
    actions: [
      { action: 'open', title: 'Enviar Informe' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana del sitio abierta, enfócala y navega a targetUrl si se puede
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          // Navegación (si el navegador lo permite)
          if ('navigate' in client) return client.navigate(targetUrl);
          return;
        }
      }
      // Si no hay ventanas, abre una nueva
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
