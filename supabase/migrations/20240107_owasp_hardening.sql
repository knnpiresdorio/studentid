-- 20240107_owasp_hardening.sql

-- Fix: Drop function CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;

-- 1. Helper Function for Role Checks (Using PROFILES now)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Enable RLS on ALL known tables
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dependents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.promotions ENABLE ROW LEVEL SECURITY; -- Table missing
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.change_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.invites ENABLE ROW LEVEL SECURITY; -- Table missing
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Define Policies

-- === SCHOOLS ===
DROP POLICY IF EXISTS "Public can view schools" ON public.schools;
CREATE POLICY "Public can view schools" ON public.schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins full access schools" ON public.schools;
CREATE POLICY "Admins full access schools" ON public.schools FOR ALL USING (public.get_my_role() = 'ADMIN');

-- === STUDENTS === (CamelCase columns: schoolId)
DROP POLICY IF EXISTS "Students view own profile" ON public.students;
CREATE POLICY "Students view own profile" ON public.students FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "School Admins view own students" ON public.students;
CREATE POLICY "School Admins view own students" ON public.students FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role::text = 'SCHOOL_ADMIN'
  ) 
  AND 
  "schoolId" = (SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Admins full access students" ON public.students;
CREATE POLICY "Admins full access students" ON public.students FOR ALL USING (public.get_my_role() = 'ADMIN');

-- === PARTNERS === (CamelCase columns: schoolId, isActive)
DROP POLICY IF EXISTS "Public view active partners" ON public.partners;
CREATE POLICY "Public view active partners" ON public.partners FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "Admins full access partners" ON public.partners;
CREATE POLICY "Admins full access partners" ON public.partners FOR ALL USING (public.get_my_role() = 'ADMIN');

-- === DEPENDENTS === (snake_case: master_id)
DROP POLICY IF EXISTS "Parents view own dependents" ON public.dependents;
CREATE POLICY "Parents view own dependents" ON public.dependents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s WHERE s.id = public.dependents.master_id AND s.id::text = auth.uid()::text) 
);

DROP POLICY IF EXISTS "Admins full access dependents" ON public.dependents;
CREATE POLICY "Admins full access dependents" ON public.dependents FOR ALL USING (public.get_my_role() = 'ADMIN');

-- === AUDIT LOGS === (snake_case)
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (public.get_my_role() = 'ADMIN');

DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- === CHANGE REQUESTS === (snake_case)
DROP POLICY IF EXISTS "Admins full access change_requests" ON public.change_requests;
CREATE POLICY "Admins full access change_requests" ON public.change_requests FOR ALL USING (public.get_my_role() = 'ADMIN');

-- === PROFILES === (snake_case)
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.get_my_role() = 'ADMIN');

DROP POLICY IF EXISTS "School Admins view school profiles" ON public.profiles;
CREATE POLICY "School Admins view school profiles" ON public.profiles FOR SELECT USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Partners view student profiles" ON public.profiles;
CREATE POLICY "Partners view student profiles" ON public.profiles FOR SELECT USING (
  public.get_my_role() IN ('STORE', 'STORE_ADMIN') AND role::text = 'STUDENT'
);

-- 4. Audit Log Retention (Cron Job)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 1 year
  DELETE FROM public.audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule(
  'cleanup_old_audit_logs_job',
  '0 3 * * *',
  $$SELECT public.cleanup_old_audit_logs()$$
);

-- === PREVENT SECURITY DEFINER ABUSE ===
REVOKE EXECUTE ON FUNCTION public.get_my_role FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;
