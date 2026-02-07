-- Ajustes administrativos para padrón y revisión de envíos
-- 1) Mapear nombres capturados con el padrón (alias -> nombre canónico)
-- 2) Agregar miembros manualmente al padrón (sin tocar el padrón base en código)
-- 3) Marcar envíos como duplicados o corregidos por administración

CREATE TABLE IF NOT EXISTS public.report_admin_name_mappings (
  alias_normalized TEXT PRIMARY KEY,
  canonical_full_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NULL REFERENCES auth.users(id)
);

ALTER TABLE public.report_admin_name_mappings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.report_admin_custom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT UNIQUE NOT NULL,
  group_number INTEGER NOT NULL CHECK (group_number BETWEEN 1 AND 20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NULL REFERENCES auth.users(id)
);

ALTER TABLE public.report_admin_custom_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.report_admin_report_flags (
  report_id UUID PRIMARY KEY REFERENCES public.service_reports(id) ON DELETE CASCADE,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  canonical_full_name TEXT NULL,
  note TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NULL REFERENCES auth.users(id)
);

ALTER TABLE public.report_admin_report_flags ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at en tablas de ajustes
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp_admin_tools()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_report_admin_name_mappings_updated_at ON public.report_admin_name_mappings;
CREATE TRIGGER trg_report_admin_name_mappings_updated_at
BEFORE UPDATE ON public.report_admin_name_mappings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp_admin_tools();

DROP TRIGGER IF EXISTS trg_report_admin_custom_members_updated_at ON public.report_admin_custom_members;
CREATE TRIGGER trg_report_admin_custom_members_updated_at
BEFORE UPDATE ON public.report_admin_custom_members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp_admin_tools();

DROP TRIGGER IF EXISTS trg_report_admin_report_flags_updated_at ON public.report_admin_report_flags;
CREATE TRIGGER trg_report_admin_report_flags_updated_at
BEFORE UPDATE ON public.report_admin_report_flags
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp_admin_tools();

-- Limpieza de políticas previas (por si existe una migración parcial)
DROP POLICY IF EXISTS "Admins can read name mappings" ON public.report_admin_name_mappings;
DROP POLICY IF EXISTS "Admins can write name mappings" ON public.report_admin_name_mappings;
DROP POLICY IF EXISTS "Admins can delete name mappings" ON public.report_admin_name_mappings;

DROP POLICY IF EXISTS "Admins can read custom roster members" ON public.report_admin_custom_members;
DROP POLICY IF EXISTS "Admins can insert custom roster members" ON public.report_admin_custom_members;
DROP POLICY IF EXISTS "Admins can update custom roster members" ON public.report_admin_custom_members;
DROP POLICY IF EXISTS "Admins can delete custom roster members" ON public.report_admin_custom_members;

DROP POLICY IF EXISTS "Admins can read report flags" ON public.report_admin_report_flags;
DROP POLICY IF EXISTS "Admins can upsert report flags" ON public.report_admin_report_flags;
DROP POLICY IF EXISTS "Admins can delete report flags" ON public.report_admin_report_flags;

-- Helper de seguridad: usuario admin (incluye super_admin porque también existe en admin_profiles)
-- SELECT
CREATE POLICY "Admins can read name mappings"
ON public.report_admin_name_mappings
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can write name mappings"
ON public.report_admin_name_mappings
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can read custom roster members"
ON public.report_admin_custom_members
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can insert custom roster members"
ON public.report_admin_custom_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can update custom roster members"
ON public.report_admin_custom_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can delete custom roster members"
ON public.report_admin_custom_members
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can read report flags"
ON public.report_admin_report_flags
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can upsert report flags"
ON public.report_admin_report_flags
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);

CREATE POLICY "Admins can delete report flags"
ON public.report_admin_report_flags
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.user_id = auth.uid())
);
