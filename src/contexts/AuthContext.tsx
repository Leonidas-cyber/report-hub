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

    const { data, error } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      // Si la columna role todavía no existe en BD, no rompemos sesión
      if (!/column .*role.* does not exist/i.test(error.message || '')) {
        console.warn('No se pudo cargar rol de admin:', error.message);
      }
      setIsSuperAdmin(false);
      return;
    }

    setIsSuperAdmin((data as any)?.role === 'super_admin');
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadAdminFlags(currentSession.user);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }

      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadAdminFlags(currentSession.user);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
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
