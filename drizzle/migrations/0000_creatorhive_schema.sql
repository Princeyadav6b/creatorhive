
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('creator', 'client');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE public.rate_type AS ENUM ('fixed', 'hourly');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles are viewable by everyone" ON public.user_roles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- timestamps helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- new user handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  _role := CASE WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'client') = 'creator'
                THEN 'creator'::public.app_role ELSE 'client'::public.app_role END;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GIGS
CREATE TABLE public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  creator_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  rate NUMERIC(12,2) NOT NULL CHECK (rate > 0),
  rate_type public.rate_type NOT NULL DEFAULT 'fixed',
  description TEXT NOT NULL,
  delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT gigs_title_len CHECK (char_length(title) BETWEEN 5 AND 80),
  CONSTRAINT gigs_desc_len CHECK (char_length(description) BETWEEN 30 AND 1000)
);
CREATE INDEX gigs_creator_idx ON public.gigs (creator_id);
CREATE INDEX gigs_active_created_idx ON public.gigs (is_active, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gigs TO authenticated;
GRANT SELECT ON public.gigs TO anon;
GRANT ALL ON public.gigs TO service_role;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active gigs are public" ON public.gigs FOR SELECT USING (is_active OR auth.uid() = creator_id);
CREATE POLICY "Creators can insert own gigs" ON public.gigs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id AND public.has_role(auth.uid(), 'creator'));
CREATE POLICY "Creators can update own gigs" ON public.gigs FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own gigs" ON public.gigs FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);
CREATE TRIGGER gigs_set_updated_at BEFORE UPDATE ON public.gigs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BOOKINGS
CREATE SEQUENCE public.booking_reference_seq START 1042;
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE DEFAULT ('CH-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.booking_reference_seq')::text, 5, '0')),
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  gig_title TEXT NOT NULL,
  creator_id UUID NOT NULL,
  creator_name TEXT NOT NULL DEFAULT '',
  client_id UUID NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  project_title TEXT NOT NULL,
  requirements TEXT NOT NULL,
  preferred_start_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  budget NUMERIC(12,2) NOT NULL CHECK (budget > 0),
  contact_email TEXT NOT NULL,
  reference_link TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_dates CHECK (expected_delivery_date >= preferred_start_date),
  CONSTRAINT bookings_requirements_len CHECK (char_length(requirements) >= 20)
);
GRANT SELECT ON public.booking_reference_seq TO authenticated, anon;
GRANT USAGE ON SEQUENCE public.booking_reference_seq TO authenticated, service_role;
CREATE INDEX bookings_client_idx ON public.bookings (client_id, created_at DESC);
CREATE INDEX bookings_creator_idx ON public.bookings (creator_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = creator_id);
CREATE POLICY "Clients create bookings" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client') AND auth.uid() <> creator_id AND status = 'pending');
CREATE POLICY "Creators update booking status" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
