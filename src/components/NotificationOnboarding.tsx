import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPushSubscriptionStatus,
  isPushNotificationSupported,
  subscribeToPushNotifications,
} from '@/utils/pushNotifications';
import { toast } from 'sonner';

const SESSION_DISMISS_KEY = 'notif_onboarding_dismissed_session_v1';

export function NotificationOnboarding() {
  const [visible, setVisible] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      if (!isPushNotificationSupported()) return;

      // Si lo cerró en esta sesión, no volver a mostrar hasta la próxima visita.
      const dismissedThisSession = sessionStorage.getItem(SESSION_DISMISS_KEY) === '1';
      if (dismissedThisSession) return;

      // Solo mostrar si NO están habilitadas (suscripción activa real)
      const subscribed = await getPushSubscriptionStatus();
      if (!mounted || subscribed) return;

      const denied = Notification.permission === 'denied';
      setIsDenied(denied);
      setVisible(true);
    };

    check();

    return () => {
      mounted = false;
    };
  }, []);

  const closeForSession = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
    setVisible(false);
  };

  const handleEnable = async () => {
    if (isDenied) {
      toast.error('Notificaciones bloqueadas. Actívalas en la configuración del navegador.');
      closeForSession();
      return;
    }

    setIsLoading(true);
    try {
      const success = await subscribeToPushNotifications();
      if (success) {
        toast.success('¡Notificaciones activadas correctamente!');
        sessionStorage.removeItem(SESSION_DISMISS_KEY);
        setVisible(false);
      } else {
        if (Notification.permission === 'denied') {
          setIsDenied(true);
          toast.error('Permiso bloqueado. Habilítalo en la configuración del navegador.');
        } else {
          toast.error('No se pudieron activar las notificaciones. Intenta nuevamente.');
        }
      }
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
      toast.error('Ocurrió un error al activar notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[470px]">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-full bg-primary/10 p-2">
            {isDenied ? (
              <BellOff className="h-5 w-5 text-primary" />
            ) : (
              <Bell className="h-5 w-5 text-primary" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-base sm:text-lg font-semibold">Activar notificaciones</p>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Para no olvidar su informe mensual, le recomendamos activar las notificaciones.
            </p>

            {isDenied && (
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                En este navegador están bloqueadas. Puede habilitarlas desde la configuración del sitio.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {!isDenied && (
                <Button onClick={handleEnable} disabled={isLoading} className="text-sm sm:text-base px-5">
                  {isLoading ? 'Activando...' : 'Activar'}
                </Button>
              )}
              <Button variant="outline" onClick={closeForSession} className="text-sm sm:text-base px-5">
                Ahora no
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
