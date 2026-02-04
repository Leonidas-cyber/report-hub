import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';
import { 
  subscribeToPushNotifications,
  getPushSubscriptionStatus,
  isPushNotificationSupported
} from '@/utils/pushNotifications';
import { 
  requestNotificationPermission, 
  checkNotificationStatus,
  setupNotifications 
} from '@/utils/notifications';
import { toast } from 'sonner';

export function NotificationPrompt() {
  const [status, setStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      // Check real push notification status first
      if (isPushNotificationSupported()) {
        const pushStatus = await getPushSubscriptionStatus();
        if (pushStatus === 'subscribed') {
          setStatus('granted');
          return;
        } else if (pushStatus === 'unsupported') {
          // Fall back to local notification check
          setStatus(checkNotificationStatus());
          return;
        }
      }
      // Default to checking local notification status
      setStatus(checkNotificationStatus());
    };
    checkStatus();
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      // Try real push notifications first
      if (isPushNotificationSupported()) {
        const success = await subscribeToPushNotifications();
        if (success) {
          setStatus('granted');
          toast.success('¡Notificaciones activadas! Recibirás recordatorios cada mes.');
          return;
        }
      }
      
      // Fallback to local notifications
      const success = await setupNotifications();
      if (success) {
        setStatus('granted');
        toast.success('¡Notificaciones activadas! Te recordaremos cada mes.');
      } else {
        setStatus('denied');
        toast.error('No se pudieron activar las notificaciones');
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
