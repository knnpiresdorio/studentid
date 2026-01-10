-- Migration: Admin Login Refactor & Simplified Attendants
-- Date: 2026-01-09

-- 1. Schema Updates
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id);

-- 2. Store Attendants Table (Simplified Login)
CREATE TABLE IF NOT EXISTS public.store_attendants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on store_attendants
ALTER TABLE public.store_attendants ENABLE ROW LEVEL SECURITY;

-- Policies for store_attendants
CREATE POLICY "Store Admins can manage their own attendants"
ON public.store_attendants
FOR ALL
USING (
    get_my_role() = 'STORE_ADMIN' 
    AND partner_id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
);

-- 3. Identity Check RPCs
CREATE OR REPLACE FUNCTION public.check_school_identity(check_cnpj TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
    v_name TEXT;
    v_has_admin BOOLEAN;
BEGIN
    SELECT id, name INTO v_id, v_name 
    FROM public.schools 
    WHERE cnpj = check_cnpj OR id::text = check_cnpj -- fallback to ID just in case
    LIMIT 1;

    IF v_id IS NULL THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE school_id = v_id AND role = 'SCHOOL_ADMIN'
    ) INTO v_has_admin;

    RETURN jsonb_build_object(
        'found', true,
        'id', v_id,
        'name', v_name,
        'activated', v_has_admin
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_partner_identity(check_cnpj TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
    v_name TEXT;
    v_has_admin BOOLEAN;
BEGIN
    SELECT id, name INTO v_id, v_name 
    FROM public.partners 
    WHERE cnpj = check_cnpj OR id::text = check_cnpj
    LIMIT 1;

    IF v_id IS NULL THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE partner_id = v_id AND role = 'STORE_ADMIN'
    ) INTO v_has_admin;

    RETURN jsonb_build_object(
        'found', true,
        'id', v_id,
        'name', v_name,
        'activated', v_has_admin
    );
END;
$$;

-- 4. Attendant Login RPC
CREATE OR REPLACE FUNCTION public.login_attendant(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attendant RECORD;
    v_partner RECORD;
BEGIN
    SELECT * INTO v_attendant 
    FROM public.store_attendants 
    WHERE username = p_username AND password = p_password AND is_active = TRUE
    LIMIT 1;

    IF v_attendant.id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT * INTO v_partner FROM public.partners WHERE id = v_attendant.partner_id;

    RETURN jsonb_build_object(
        'id', v_attendant.id,
        'name', v_attendant.name,
        'username', v_attendant.username,
        'role', 'STORE',
        'partner_id', v_attendant.partner_id,
        'partner_name', v_partner.name,
        'is_attendant', true
    );
END;
$$;

-- 5. Update handle_new_user to respect metadata for admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role;
    v_school_id UUID;
    v_partner_id UUID;
BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT');
    v_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
    v_partner_id := (NEW.raw_user_meta_data->>'partner_id')::UUID;

    INSERT INTO public.profiles (id, full_name, role, school_id, partner_id, cpf)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substring(NEW.id::text, 1, 8)),
        v_role,
        v_school_id,
        v_partner_id,
        NEW.raw_user_meta_data->>'cpf'
    );

    INSERT INTO public.user_roles (id, role)
    VALUES (NEW.id, v_role::text);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 6. Helper to create attendants securely
CREATE OR REPLACE FUNCTION public.create_attendant(
    p_partner_id UUID,
    p_name TEXT,
    p_username TEXT,
    p_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Check if user has permission (STORE_ADMIN of the same partner)
    IF get_my_role() <> 'STORE_ADMIN' THEN
        RAISE EXCEPTION 'Only store admins can create attendants';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND partner_id = p_partner_id
    ) THEN
        RAISE EXCEPTION 'You do not have permission to manage this partner';
    END IF;

    INSERT INTO public.store_attendants (partner_id, name, username, password)
    VALUES (p_partner_id, p_name, p_username, p_password)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;
