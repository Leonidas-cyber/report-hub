import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ImageCropper } from '@/components/ImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sendPushNotificationToAll, isPushNotificationSupported } from '@/utils/pushNotifications';
import { sendBroadcastNotification } from '@/utils/notifications';
import { ArrowLeft, RefreshCw, FileSpreadsheet, LogOut, Camera, User, Bell, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminProfile {
  full_name: string | null;
  avatar_url: string | null;
}

interface AdminHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onClearDatabase: () => void;
  isRefreshing: boolean;
}

export function AdminHeader({ onRefresh, onExport, onClearDatabase, isRefreshing }: AdminHeaderProps) {
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const getPreviousMonthName = (): string => {
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    return months[previousMonth];
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('admin_profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
      return;
    }

    // Si no existe perfil, créalo
    const defaultName =
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Administrador';

    const { data: created, error: createError } = await supabase
      .from('admin_profiles')
      .upsert(
        { user_id: user.id, full_name: defaultName },
        { onConflict: 'user_id' }
      )
      .select('full_name, avatar_url')
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return;
    }

    setProfile(created);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida');
      return;
    }

    // Límite 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropperOpen(true);
      // Limpia input para permitir volver a elegir el mismo archivo
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploading(true);
    try {
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Evita caché del navegador
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Administrador';

      // Crea/actualiza perfil y guarda avatar_url
      const { data: savedProfile, error: profileError } = await supabase
        .from('admin_profiles')
        .upsert(
          {
            user_id: user.id,
            full_name: fullName,
            avatar_url: urlWithCacheBuster,
          },
          { onConflict: 'user_id' }
        )
        .select('full_name, avatar_url')
        .single();

      if (profileError) throw profileError;

      setProfile(savedProfile);
      toast.success('Foto de perfil actualizada');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error?.message || 'Error al subir la foto');
    } finally {
      setUploading(false);
      setCropperOpen(false);
    }
  };

  const handleSendNotification = async () => {
    setSendingNotification(true);
    try {
      const previousMonth = getPreviousMonthName();
      const message = `¡Recuerda enviar tu informe de servicio de ${previousMonth}! - Congregación Arrayanes`;

      if (isPushNotificationSupported()) {
        const result = await sendPushNotificationToAll(message);
        if (result?.success) {
          toast.success(`Notificación enviada a ${result.sent || 0} dispositivos`);
        } else {
          const localSuccess = await sendBroadcastNotification(message);
          if (localSuccess) toast.success('Notificación enviada (solo este dispositivo)');
          else toast.error('No se pudo enviar la notificación');
        }
      } else {
        const success = await sendBroadcastNotification(message);
        if (success) toast.success('Notificación enviada (solo este dispositivo)');
        else toast.error('Las notificaciones no están habilitadas');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al enviar la notificación');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Administrador';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Welcome message */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group flex-shrink-0" type="button">
                    <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-primary/20 hover:border-primary transition-colors">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56 bg-popover">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <label className="cursor-pointer flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      {uploading ? 'Subiendo...' : 'Cambiar foto'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">{user?.email}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  ¡Bienvenido, {displayName}!
                </h1>
                <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
                  Gestiona los informes de la congregación
                </p>
              </div>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendNotification}
                disabled={sendingNotification}
                className="px-2 sm:px-3"
              >
                <Bell className={`h-4 w-4 sm:mr-2 ${sendingNotification ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">
                  {sendingNotification ? 'Enviando...' : 'Recordatorio'}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-2 sm:px-3"
              >
                <RefreshCw className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>

              <Button className="btn-excel px-2 sm:px-3" onClick={onExport} size="sm">
                <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Excel</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="px-2 sm:px-3">
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Borrar</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará TODOS los informes de la base de datos.
                      Esta acción no se puede deshacer. Se recomienda exportar a Excel
                      antes de continuar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onClearDatabase}
                      className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sí, borrar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={selectedImage}
        onCropComplete={handleCroppedImage}
      />
    </>
  );
}
