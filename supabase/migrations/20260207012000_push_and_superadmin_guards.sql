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
-- =============================================
CREATE OR REPLACE FUNCTION public.set_admin_role(target_user_id uuid, new_role public.admin_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;

  IF target_user_id = auth.uid() AND new_role = 'admin' THEN
    RAISE EXCEPTION 'No puedes quitarte tu propio rol de super admin';
  END IF;

  INSERT INTO public.admin_profiles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, public.admin_role) TO authenticated;
