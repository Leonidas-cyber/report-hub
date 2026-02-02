-- Enum para roles
CREATE TYPE public.service_role AS ENUM ('publicador', 'precursor_auxiliar', 'precursor_regular');

-- Enum para estado del informe
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'edited');

-- Tabla de superintendentes
CREATE TABLE public.superintendents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de informes (pública para envío)
CREATE TABLE public.service_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role service_role NOT NULL,
  hours INTEGER,
  bible_courses INTEGER,
  participated BOOLEAN NOT NULL DEFAULT true,
  superintendent_id UUID REFERENCES public.superintendents(id),
  notes TEXT DEFAULT '',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de perfiles de administradores
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.superintendents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para superintendents (lectura pública, escritura solo admins)
CREATE POLICY "Anyone can read superintendents"
  ON public.superintendents FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage superintendents"
  ON public.superintendents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para service_reports (inserción pública, lectura/edición solo admins)
CREATE POLICY "Anyone can insert reports"
  ON public.service_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can read reports"
  ON public.service_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update reports"
  ON public.service_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para admin_profiles
CREATE POLICY "Users can view own profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger para crear perfil de admin automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_service_reports_updated_at
  BEFORE UPDATE ON public.service_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para informes
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_reports;

-- Insertar superintendentes de ejemplo
INSERT INTO public.superintendents (name, group_number) VALUES
  ('Alberto G.', 1),
  ('David N.', 2),
  ('Abraham G.', 3),
  ('Rogelio T.', 4),
  ('Rafael G.', 5);

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Políticas de storage para avatares
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);