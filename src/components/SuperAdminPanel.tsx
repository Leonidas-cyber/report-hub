import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Mail, RefreshCw, Search, Shield, ShieldCheck, Users } from 'lucide-react';

interface AdminAccount {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'super_admin';
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

interface SuperAdminPanelProps {
  currentUserId?: string;
}

const formatDate = (value: string | null) => {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export function SuperAdminPanel({ currentUserId }: SuperAdminPanelProps) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sendingRecoveryFor, setSendingRecoveryFor] = useState<string | null>(null);
  const [changingRoleFor, setChangingRoleFor] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await (supabase.rpc as any)('list_admin_accounts');

    if (error) {
      console.error(error);
      toast.error(`No se pudo cargar el listado de administradores: ${error.message}`);
      setLoading(false);
      return;
    }

    setAccounts((data || []) as AdminAccount[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return accounts;

    return accounts.filter((a) =>
      [a.full_name, a.email, a.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(normalized)),
    );
  }, [accounts, search]);

  const handleSendRecovery = async (email: string | null) => {
    if (!email) {
      toast.error('Este administrador no tiene correo disponible.');
      return;
    }

    setSendingRecoveryFor(email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSendingRecoveryFor(null);

    if (error) {
      toast.error(`No se pudo enviar el correo de recuperación: ${error.message}`);
      return;
    }

    toast.success(`Correo de recuperación enviado a ${email}`);
  };

  const handleChangeRole = async (targetUserId: string, newRole: 'admin' | 'super_admin') => {
    setChangingRoleFor(targetUserId);

    const { error } = await (supabase.rpc as any)('set_admin_role', {
      target_user_id: targetUserId,
      new_role: newRole,
    });

    setChangingRoleFor(null);

    if (error) {
      toast.error(`No se pudo actualizar el rol: ${error.message}`);
      return;
    }

    setAccounts((prev) =>
      prev.map((a) => (a.user_id === targetUserId ? { ...a, role: newRole } : a)),
    );

    toast.success('Rol actualizado correctamente.');
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Control de Super Admin
            </CardTitle>
            <CardDescription>
              Administra roles, ve fotos de perfil y envía recuperación de contraseña.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchAccounts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {filteredAccounts.length} administradores
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Cargando administradores...
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No hay administradores para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => {
                  const initials = (account.full_name || account.email || 'A')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <TableRow key={account.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={account.avatar_url || undefined} alt={account.full_name || 'Avatar'} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="font-medium leading-none">{account.full_name || 'Sin nombre'}</p>
                            <p className="text-xs text-muted-foreground">{account.email || 'Sin correo'}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={account.role === 'super_admin' ? 'default' : 'secondary'}>
                            {account.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </Badge>
                          {account.user_id === currentUserId ? (
                            <Badge variant="outline">Tú</Badge>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">{formatDate(account.created_at)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(account.last_sign_in_at)}</TableCell>

                      <TableCell>
                        <div className="flex flex-col md:flex-row justify-end gap-2">
                          <Select
                            value={account.role}
                            onValueChange={(value) => {
                              if (value !== 'admin' && value !== 'super_admin') return;
                              handleChangeRole(account.user_id, value);
                            }}
                            disabled={changingRoleFor === account.user_id}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="super_admin">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-4 w-4" />
                                  Super Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            onClick={() => handleSendRecovery(account.email)}
                            disabled={sendingRecoveryFor === account.email}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {sendingRecoveryFor === account.email ? 'Enviando...' : 'Recuperación'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Nota: para recuperación por correo, verifica en Supabase Authentication &gt; URL Configuration que el redirect
          permitido incluya <span className="font-mono">/reset-password</span>.
        </p>
      </CardContent>
    </Card>
  );
}
