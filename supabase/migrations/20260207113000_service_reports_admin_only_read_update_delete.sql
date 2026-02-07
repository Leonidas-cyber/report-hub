-- Restringe lectura y edición de informes solo a administradores autenticados.
-- Inserción pública se mantiene para el formulario de envío.

DROP POLICY IF EXISTS "Authenticated can read reports" ON public.service_reports;
DROP POLICY IF EXISTS "Authenticated can update reports" ON public.service_reports;
DROP POLICY IF EXISTS "Admins can read reports" ON public.service_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.service_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.service_reports;

CREATE POLICY "Admins can read reports"
ON public.service_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update reports"
ON public.service_reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete reports"
ON public.service_reports
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
  )
);
