-- Permitir borrar TODOS los informes solo a super_admin
CREATE OR REPLACE FUNCTION public.clear_all_service_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo un super administrador puede borrar todos los informes.';
  END IF;

  DELETE FROM public.service_reports;
END;
$$;

REVOKE ALL ON FUNCTION public.clear_all_service_reports() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_all_service_reports() TO authenticated;
