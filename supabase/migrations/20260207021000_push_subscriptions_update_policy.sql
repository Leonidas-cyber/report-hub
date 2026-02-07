-- Allow updates to existing push subscriptions (required for upsert on endpoint conflict)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'push_subscriptions'
      AND policyname = 'Anyone can update push subscriptions'
  ) THEN
    CREATE POLICY "Anyone can update push subscriptions"
      ON public.push_subscriptions
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
