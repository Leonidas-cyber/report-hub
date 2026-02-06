import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';
import { 
  subscribeToPushNotifications,
  getPushSubscriptionStatus,
  isPushNotificationSupported
} from '@/utils/pushNotifications';
import { toast } from 'sonner';

export function NotificationPrompt() {
  const [status, setStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (isPushNotificationSupported()) {
        const pushStatus = await getPushSubscriptionStatus();

        if (pushStatus === 'subscribed') {
          setStatus('granted');
          return;
        }

        // Si el navegador soporta push pero no hay suscripción,
        // NO marcar como activado aunque el permiso esté concedido.
        if (Notification.permission === 'denied') {
          setStatus('denied');
        } else {
          setStatus('default');
        }
        return;
      }

      // Navegador sin soporte Push
      if (!('Notification' in window)) {
        setStatus('unsupported');
      } else {
        setStatus(Notification.permission as 'granted' | 'denied' | 'default');
      }
    };

    checkStatus();
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      if (!isPushNotificationSupported()) {
        setStatus('unsupported');
        toast.error('Tu navegador no soporta notificaciones push');
        return;
      }

      const success = await subscribeToPushNotifications();

      if (success) {
        setStatus('granted');
        toast.success('¡Notificaciones activadas! Recibirás recordatorios aunque cierres la app.');
      } else {
        if (Notification.permission === 'denied') {
          setStatus('denied');
          toast.error('Permiso bloqueado. Habilítalo en la configuración del navegador.');
        } else {
          setStatus('default');
          toast.error('No se pudo guardar la suscripción en la base de datos.');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'unsupported') {
    return null;
  }

  if (status === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <Check className="h-4 w-4" />
        <span>Notificaciones activadas</span>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4" />
        <span>Notificaciones bloqueadas</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnableNotifications}
      disabled={isLoading}
      className="gap-2"
    >
      <Bell className="h-4 w-4" />
      {isLoading ? 'Activando...' : 'Activar recordatorios'}
    </Button>
  );
}
