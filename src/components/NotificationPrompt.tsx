import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';
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
    setStatus(checkNotificationStatus());
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
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
