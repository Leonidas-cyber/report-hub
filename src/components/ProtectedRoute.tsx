import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

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

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hardStop = setTimeout(() => {
      if (mounted) {
        console.warn('ProtectedRoute tardó demasiado; liberando check de acceso.');
        setCheckingAccess(false);
      }
    }, 9000);

    const checkAdminAccess = async () => {
      if (!user?.email) {
        if (mounted) {
          setIsAllowed(false);
          setCheckingAccess(false);
        }
        return;
      }

      try {
        // Cast a any para evitar fricción de tipos hasta regenerar types.ts
        const { data, error } = await withTimeout(
          (supabase as any).rpc('is_admin_email', {
            p_email: user.email,
          }),
        );

        if (!mounted) return;

        if (error) {
          console.error('Error checking admin access:', error);
          // Fallback temporal si aún no ejecutas la migración de allowlist
          const msg = String(error?.message || '').toLowerCase();
          if (msg.includes('is_admin_email') || msg.includes('function')) {
            setIsAllowed(true);
          } else {
            setIsAllowed(false);
          }
        } else {
          setIsAllowed(Boolean(data));
        }
      } catch (err) {
        console.error('Timeout/error checking admin access:', err);
        if (!mounted) return;
        setIsAllowed(false);
      } finally {
        if (mounted) setCheckingAccess(false);
      }
    };

    if (!loading) {
      void checkAdminAccess();
    }

    return () => {
      mounted = false;
      clearTimeout(hardStop);
    };
  }, [user, loading]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/login?unauthorized=1" replace />;
  }

  return <>{children}</>;
}
