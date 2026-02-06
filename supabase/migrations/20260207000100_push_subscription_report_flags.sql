-- Permite asociar suscripciones push con el estado de envío de informe por periodo
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS subscriber_name text,
  ADD COLUMN IF NOT EXISTS subscriber_name_norm text,
  ADD COLUMN IF NOT EXISTS last_report_month text,
  ADD COLUMN IF NOT EXISTS last_report_year integer;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_report_period
  ON public.push_subscriptions (last_report_year, last_report_month);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_subscriber_name_norm
  ON public.push_subscriptions (subscriber_name_norm);
