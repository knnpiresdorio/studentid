
-- 1. SQL Schema & Enums

-- Create custom enums
CREATE TYPE user_role AS ENUM ('consumidor', 'atendente', 'admin_loja', 'admin_escola', 'super_admin');
CREATE TYPE benefit_type AS ENUM ('geral', 'unico', 'mensal');
CREATE TYPE request_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- Schools Table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (Linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'consumidor' NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benefits Table
CREATE TABLE benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type benefit_type DEFAULT 'geral' NOT NULL,
  value TEXT, -- e.g., '10% discount'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dependents Table
CREATE TABLE dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benefit Usage Table
CREATE TABLE benefit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  benefit_id UUID REFERENCES benefits(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Automation of Profiles (Triggers)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substring(NEW.id::text, 1, 8)),
    'consumidor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile creation on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Security RLS (Row Level Security)

-- Auxiliary function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "School Admins can read profiles from their school" ON profiles
  FOR SELECT USING (
    get_my_role() = 'admin_escola' AND 
    school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  );

-- Policies for Audit Logs
CREATE POLICY "Only Super Admins can read audit logs" ON audit_logs
  FOR SELECT USING (get_my_role() = 'super_admin');

CREATE POLICY "Admins can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (get_my_role() IN ('admin_loja', 'admin_escola', 'super_admin'));

-- Default allow read for general entities (Schools, Partners, Benefits)
CREATE POLICY "Public read access for schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read access for partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Public read access for benefits" ON benefits FOR SELECT USING (true);
