-- Consolidated Supabase Schema - UniPass v2.0
-- Standards: English Enums, LGPD Compliance, Hardened RLS

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('STUDENT', 'STORE', 'STORE_ADMIN', 'ADMIN', 'SCHOOL_ADMIN');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE benefit_type AS ENUM ('GENERAL', 'ONCE', 'MONTHLY');

-- 2. TABLES
-- Schools Table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  revenue_share_pct NUMERIC(5,2) DEFAULT 30.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (Linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'STUDENT' NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  avatar_url TEXT,
  cpf TEXT,
  course TEXT,
  registration_number TEXT,
  valid_until TIMESTAMPTZ,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  consent_push BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active',
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benefits Table
CREATE TABLE benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type benefit_type DEFAULT 'GENERAL' NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dependents Table
CREATE TABLE dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE,
  status request_status DEFAULT 'PENDING',
  rejection_reason TEXT,
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
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substring(NEW.id::text, 1, 8)),
    'STUDENT'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VIEWS
CREATE OR REPLACE VIEW vw_financial_summary AS
SELECT 
  s.id as school_id,
  s.name as school_name,
  COUNT(d.id) FILTER (WHERE d.status = 'APPROVED') as total_dependents_active,
  COALESCE(
    (COUNT(d.id) FILTER (WHERE d.status = 'APPROVED') * 29.90) * (s.revenue_share_pct / 100), 
    0
  ) as platform_estimated_revenue
FROM schools s
LEFT JOIN profiles p ON p.school_id = s.id
LEFT JOIN dependents d ON d.master_id = p.id
GROUP BY s.id, s.name, s.revenue_share_pct;

-- 5. RLS POLICIES
-- Schools
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for schools" ON schools FOR SELECT TO authenticated USING (true);

-- Partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for partners" ON partners FOR SELECT TO authenticated USING (true);

-- Benefits
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for benefits" ON benefits FOR SELECT TO authenticated USING (true);

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "School Admins can read profiles from their school" ON profiles 
  FOR SELECT USING (get_my_role() = 'SCHOOL_ADMIN' AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Partners can read profiles for validation" ON profiles
  FOR SELECT USING (get_my_role() IN ('STORE', 'STORE_ADMIN'));
CREATE POLICY "Admins see everything" ON profiles FOR ALL USING (get_my_role() = 'ADMIN');

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admins read all logs" ON audit_logs FOR SELECT USING (get_my_role() = 'ADMIN');
CREATE POLICY "School Admins read school logs" ON audit_logs FOR SELECT USING (get_my_role() = 'SCHOOL_ADMIN' AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins insert logs" ON audit_logs FOR INSERT WITH CHECK (get_my_role() IN ('SCHOOL_ADMIN', 'STORE_ADMIN', 'ADMIN'));

-- Dependents
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dependents" ON dependents FOR ALL USING (auth.uid() = master_id);
CREATE POLICY "School Admins manage dependents for approval" ON dependents FOR SELECT USING (get_my_role() = 'SCHOOL_ADMIN');
CREATE POLICY "School Admins update dependents for approval" ON dependents FOR UPDATE USING (get_my_role() = 'SCHOOL_ADMIN');
