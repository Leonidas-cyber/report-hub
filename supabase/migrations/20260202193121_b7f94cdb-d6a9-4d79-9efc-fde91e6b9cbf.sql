-- Allow authenticated users to delete service reports
CREATE POLICY "Authenticated can delete reports"
ON public.service_reports
FOR DELETE
TO authenticated
USING (true);

-- Allow avatars upload for authenticated users
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read of avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Create table for push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert push subscriptions
CREATE POLICY "Anyone can create push subscription"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

-- Anyone can read their own subscription
CREATE POLICY "Anyone can read push subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (true);

-- Anyone can delete subscriptions
CREATE POLICY "Anyone can delete push subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (true);