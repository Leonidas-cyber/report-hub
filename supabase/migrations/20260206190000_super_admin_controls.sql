-- Super Admin controls + listado de admins + gestión de roles

-- 1) Rol dentro del perfil de admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_profiles'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.admin_profiles
      ADD COLUMN role text NOT NULL DEFAULT 'admin';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_profiles_role_check'
  ) THEN
    ALTER TABLE public.admin_profiles
      ADD CONSTRAINT admin_profiles_role_check
      CHECK (role IN ('admin', 'super_admin'));
  END IF;
END $$;

-- Si todavía no hay super_admin, promovemos al primer admin creado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE role = 'super_admin') THEN
    UPDATE public.admin_profiles
    SET role = 'super_admin', updated_at = now()
    WHERE user_id = (
      SELECT user_id
      FROM public.admin_profiles
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
END $$;

-- 2) Helpers de permisos

CREATE INDEX IF NOT EXISTS idx_admin_profiles_role
  ON public.admin_profiles(role);

CREATE OR REPLACE FUNCTION public.is_super_admin(p_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = p_uid
      AND ap.role = 'super_admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- 3) RPC: listado completo de admins (incluye email desde auth.users)
CREATE OR REPLACE FUNCTION public.list_admin_accounts()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    ap.user_id,
    ap.full_name,
    ap.avatar_url,
    ap.role,
    u.email::text,
    u.created_at,
    u.last_sign_in_at
  FROM public.admin_profiles ap
  JOIN auth.users u ON u.id = ap.user_id
  WHERE public.is_super_admin(auth.uid())
  ORDER BY
    CASE WHEN ap.role = 'super_admin' THEN 0 ELSE 1 END,
    COALESCE(ap.full_name, u.email) ASC;
$$;

REVOKE ALL ON FUNCTION public.list_admin_accounts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_accounts() TO authenticated;

-- 4) RPC: cambiar rol de admin/super_admin
CREATE OR REPLACE FUNCTION public.set_admin_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
  super_admin_count integer;
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo un super administrador puede cambiar roles.';
  END IF;

  IF new_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Rol inválido. Usa admin o super_admin.';
  END IF;

  SELECT role INTO current_role
  FROM public.admin_profiles
  WHERE user_id = target_user_id;

  IF current_role IS NULL THEN
    RAISE EXCEPTION 'Administrador no encontrado.';
  END IF;

  IF current_role = 'super_admin' AND new_role = 'admin' THEN
    SELECT COUNT(*) INTO super_admin_count
    FROM public.admin_profiles
    WHERE role = 'super_admin';

    IF super_admin_count <= 1 THEN
      RAISE EXCEPTION 'Debe existir al menos un super administrador.';
    END IF;
  END IF;

  UPDATE public.admin_profiles
  SET role = new_role,
      updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_admin_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, text) TO authenticated;

-- 5) RLS extra para super_admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_profiles'
      AND policyname = 'admin_profiles_super_admin_select'
  ) THEN
    CREATE POLICY admin_profiles_super_admin_select
      ON public.admin_profiles
      FOR SELECT
      TO authenticated
      USING (public.is_super_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_profiles'
      AND policyname = 'admin_profiles_super_admin_update'
  ) THEN
    CREATE POLICY admin_profiles_super_admin_update
      ON public.admin_profiles
      FOR UPDATE
      TO authenticated
      USING (public.is_super_admin(auth.uid()))
      WITH CHECK (public.is_super_admin(auth.uid()));
  END IF;
END $$;
