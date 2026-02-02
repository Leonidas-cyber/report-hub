import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

  // Get current month name in Spanish
  const getCurrentMonthName = (): string => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[new Date().getMonth()];
  };

  const handleSendNotification = async () => {
    setSendingNotification(true);
    try {
      const currentMonth = getCurrentMonthName();
      const message = `¡Recuerda enviar tu informe de servicio de ${currentMonth}! - Congregación Arrayanes`;
      const success = await sendBroadcastNotification(message);
      
      if (success) {
        toast.success('Notificación enviada correctamente');
      } else {
        toast.error('Las notificaciones no están habilitadas en este dispositivo');
      }
    } catch {
      toast.error('Error al enviar la notificación');
    } finally {
      setSendingNotification(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('admin_profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('admin_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
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
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Welcome message */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative group">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 hover:border-primary transition-colors">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    {uploading ? 'Subiendo...' : 'Cambiar foto'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {user?.email}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                ¡Bienvenido, {displayName}!
              </h1>
              <p className="text-muted-foreground">
                Gestiona los informes de la congregación
              </p>
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendNotification}
              disabled={sendingNotification}
            >
              <Bell className={`h-4 w-4 mr-2 ${sendingNotification ? 'animate-pulse' : ''}`} />
              {sendingNotification ? 'Enviando...' : 'Enviar Recordatorio'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              className="btn-excel"
              onClick={onExport}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Borrar Todo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará TODOS los informes de la base de datos. 
                    Esta acción no se puede deshacer. Se recomienda exportar a Excel 
                    antes de continuar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearDatabase} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sí, borrar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
