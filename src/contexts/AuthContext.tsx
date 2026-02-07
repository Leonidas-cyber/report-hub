import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAdminRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const withTimeout = async <T,>(promise: Promise<T>, ms = 7000): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const loadAdminFlags = useCallback(async (currentUser: User | null) => {
    if (!currentUser?.id) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }

    setIsAdmin(true);

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('admin_profiles')
          .select('role')
          .eq('user_id', currentUser.id)
          .maybeSingle(),
      );

      if (error) {
        // Si la columna role todavía no existe en BD, no rompemos sesión
        if (!/column .*role.* does not exist/i.test(error.message || '')) {
          console.warn('No se pudo cargar rol de admin:', error.message);
        }
      }

      if ((data as any)?.role === 'super_admin') {
        setIsSuperAdmin(true);
        return;
      }

      // Fallback por función SQL (cuando falta/está desactualizado admin_profiles)
      const { data: isSa, error: saError } = await withTimeout(
        supabase.rpc('is_super_admin', { target_user_id: currentUser.id }),
      );

      if (saError) {
        console.warn('No se pudo validar super admin por RPC:', saError.message);
      }

      setIsSuperAdmin(Boolean(isSa));
    } catch (err) {
      console.warn('Timeout/error cargando rol de admin:', err);
      setIsSuperAdmin(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Failsafe: evita spinner infinito por cualquier error no controlado
    const hardStop = setTimeout(() => {
      if (mounted) {
        console.warn('Auth init tardó demasiado; liberando loading por failsafe.');
        setLoading(false);
      }
    }, 9000);

    const init = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await withTimeout(supabase.auth.getSession());

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadAdminFlags(currentSession.user);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } catch (err) {
        console.error('Error inicializando AuthContext:', err);
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;

      try {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadAdminFlags(currentSession.user);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } catch (err) {
        console.error('Error en onAuthStateChange:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(hardStop);
      subscription.unsubscribe();
    };
  }, [loadAdminFlags]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Validar allowlist antes de registrar
    const { data: isAllowed, error: allowError } = await (supabase.rpc as any)('is_admin_email', {
      p_email: email,
    });

    if (allowError) {
      return { error: allowError };
    }

    if (!isAllowed) {
      return { error: { message: 'Este correo no está autorizado para crear cuenta de administrador.' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: fullName },
      },
    });

    if (!error && data.user) {
      await supabase.from('admin_profiles').upsert(
        {
          user_id: data.user.id,
          full_name: fullName,
        } as any,
        { onConflict: 'user_id' },
      );
    }

    return { error };
  };

  const signOut = async () => {
    // Limpieza optimista para evitar que la UI se quede bloqueada
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);

    try {
      // Cierre local rápido (evita cuelgues por red inestable)
      await withTimeout((supabase.auth as any).signOut({ scope: 'local' }), 5000);
      // Revocación global en segundo plano (best effort)
      void (supabase.auth as any).signOut({ scope: 'global' }).catch(() => undefined);
    } catch (err) {
      console.warn('signOut fallback:', err);
      try {
        await (supabase.auth as any).signOut({ scope: 'local' });
      } catch {
        // ignore
      }
    }
  };

  const refreshAdminRole = async () => {
    await loadAdminFlags(user);
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isSuperAdmin,
    signIn,
    signUp,
    signOut,
    refreshAdminRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
