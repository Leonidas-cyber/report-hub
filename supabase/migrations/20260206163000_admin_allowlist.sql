-- 1) Lista blanca de correos para cuentas administrador
CREATE TABLE IF NOT EXISTS public.admin_allowed_emails (
  email TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_allowed_emails ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden consultar (útil para auditoría interna)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_allowed_emails'
      AND policyname = 'Authenticated can read allowed admin emails'
  ) THEN
    CREATE POLICY "Authenticated can read allowed admin emails"
      ON public.admin_allowed_emails
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 2) Función para verificar si un correo está permitido (sin exponer la lista completa)
CREATE OR REPLACE FUNCTION public.is_admin_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_allowed_emails
    WHERE lower(email) = lower(trim(p_email))
      AND enabled = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_email(TEXT) TO anon, authenticated;

-- 3) Bloquear registro de usuarios no autorizados desde Auth
CREATE OR REPLACE FUNCTION public.enforce_admin_allowlist_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR NOT public.is_admin_email(NEW.email) THEN
    RAISE EXCEPTION 'Este correo no está autorizado para crear cuenta de administrador.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_allowlist_on_signup ON auth.users;
CREATE TRIGGER enforce_admin_allowlist_on_signup
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_admin_allowlist_signup();

-- 4) (Opcional) Agrega tus correos permitidos aquí:
-- INSERT INTO public.admin_allowed_emails (email)
-- VALUES
--   ('tu_correo_1@dominio.com'),
--   ('tu_correo_2@dominio.com')
-- ON CONFLICT (email) DO NOTHING;
