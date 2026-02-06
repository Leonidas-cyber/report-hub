import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

function getReadableError(err: unknown): string {
  if (!err) return 'Error desconocido';
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    const msg = e.message ?? e.error_description ?? e.details ?? e.hint;
    if (typeof msg === 'string') return msg;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Error no legible';
    }
  }
  return 'Error no legible';
}

export function AdminHeader({ onRefresh, onExport, onClearDatabase, isRefreshing }: AdminHeaderProps) {
  const { user, signOut, isSuperAdmin } = useAuth();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [avatarBust, setAvatarBust] = useState<number>(Date.now());

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      console.error('fetchProfile error:', error);
      toast.error(`No se pudo leer perfil: ${getReadableError(error)}`);
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
      console.error('create profile error:', createError);
      toast.error(`No se pudo crear perfil: ${getReadableError(createError)}`);
      return;
    }

    setProfile(created);
  };

  const uploadAvatar = async (fileOrBlob: File | Blob) => {
    if (!user) {
      toast.error('Sesión no disponible');
      return;
    }

    setUploading(true);
    try {
      // Validar sesión real
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('No hay sesión activa para subir imagen');
      }

      const mimeType = fileOrBlob.type || 'image/jpeg';
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(mimeType)) {
        throw new Error('Formato no permitido. Usa JPG, PNG o WEBP.');
      }

      // Mantener extensión real
      const ext = mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';

      const filePath = `${session.user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileOrBlob, {
          upsert: true,
          contentType: mimeType,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('storage upload error:', uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Administrador';

      const { data: saved, error: profileError } = await supabase
        .from('admin_profiles')
        .upsert(
          {
            user_id: session.user.id,
            full_name: fullName,
            avatar_url: publicUrl, // URL limpia en BD
          },
          { onConflict: 'user_id' }
        )
        .select('full_name, avatar_url')
        .single();

      if (profileError) {
        console.error('profile upsert error:', profileError);
        throw profileError;
      }

      setProfile(saved);
      setAvatarBust(Date.now()); // cache bust en UI
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      const msg = getReadableError(err);
      console.error('uploadAvatar fatal error:', err);
      toast.error(`No se pudo subir la foto: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida');
      event.target.value = '';
      return;
    }

    // 8 MB max antes de recortar
    if (file.size > 8 * 1024 * 1024) {
      toast.error('La imagen no debe superar 8MB');
      event.target.value = '';
      return;
    }

    // Abre cropper para que el usuario elija cómo se verá su foto
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    // Limpiar para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // El cropper ya devuelve JPEG cuadrado/circular visual
    await uploadAvatar(croppedBlob);
    setCropperOpen(false);
    setSelectedImage('');
  };

  const handleCloseCropper = () => {
    setCropperOpen(false);
    setSelectedImage('');
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

  const avatarSrc = profile?.avatar_url
    ? `${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}v=${avatarBust}`
    : undefined;

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Welcome */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group flex-shrink-0" type="button" aria-label="Cambiar foto">
                    <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-primary/20 hover:border-primary transition-colors">
                      <AvatarImage src={avatarSrc} alt={displayName} />
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

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault(); // evita que cierre antes de abrir file picker
                      if (!uploading) fileInputRef.current?.click();
                    }}
                    className="cursor-pointer"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploading ? 'Subiendo...' : 'Cambiar foto'}
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">{user?.email}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* input oculto real */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                  ¡Bienvenido, {displayName}!
                </h1>
                <div className="hidden sm:flex items-center gap-2">
                  <p className="text-xs sm:text-base text-muted-foreground">
                    Gestiona los informes de la congregación
                  </p>
                  {isSuperAdmin ? <Badge variant="default">Super Admin</Badge> : null}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
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

      {/* Modal para elegir cómo se verá la foto */}
      <ImageCropper
        open={cropperOpen}
        onClose={handleCloseCropper}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
