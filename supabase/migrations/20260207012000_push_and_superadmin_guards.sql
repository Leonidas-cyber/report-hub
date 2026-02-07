-- =============================================
-- Push subscriptions: complete schema used by frontend
-- =============================================
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_report_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_email
  ON public.push_subscriptions (user_email);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active
  ON public.push_subscriptions (is_active);

-- Keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION public.touch_push_subscription_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_push_subscription_updated_at ON public.push_subscriptions;
CREATE TRIGGER trg_touch_push_subscription_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.touch_push_subscription_updated_at();

-- =============================================
-- Super admin safety: do not allow self-demotion
-- (usa TEXT, no enum)
-- =============================================
CREATE OR REPLACE FUNCTION public.set_admin_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;

  IF new_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  SELECT role INTO current_role
  FROM public.admin_profiles
  WHERE user_id = target_user_id;

  IF current_role IS NULL THEN
    RAISE EXCEPTION 'Admin profile not found';
  END IF;

  -- Bloqueo total de auto-democión
  IF target_user_id = auth.uid() AND current_role = 'super_admin' AND new_role <> 'super_admin' THEN
    RAISE EXCEPTION 'No puedes quitarte tu propio rol de super admin';
  END IF;

  UPDATE public.admin_profiles
  SET role = new_role,
      updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_admin_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, text) TO authenticated;
