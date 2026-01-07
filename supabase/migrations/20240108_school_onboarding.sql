-- Migration: School Onboarding Helpers
-- Description: Adds a helper function to create a profile and user_role before/during invitation.

-- We need a way to ensure that even if the invite is pending, 
-- we have a profile linked to the school.

CREATE OR REPLACE FUNCTION public.prepare_school_admin_v1(
    target_email TEXT,
    target_school_id UUID,
    target_full_name TEXT DEFAULT 'Administrador Institucional'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- 1. Check if user already exists in auth.users
    SELECT id INTO existing_user_id FROM auth.users WHERE email = target_email;

    IF existing_user_id IS NOT NULL THEN
        -- Link existing user if not already linked
        INSERT INTO public.profiles (id, full_name, role, school_id)
        VALUES (existing_user_id, target_full_name, 'SCHOOL_ADMIN', target_school_id)
        ON CONFLICT (id) DO UPDATE 
        SET role = 'SCHOOL_ADMIN', school_id = target_school_id;

        INSERT INTO public.user_roles (id, role)
        VALUES (existing_user_id, 'SCHOOL_ADMIN')
        ON CONFLICT (id) DO UPDATE SET role = 'SCHOOL_ADMIN';
        
        RETURN jsonb_build_object('success', true, 'status', 'linked_existing', 'user_id', existing_user_id);
    ELSE
        -- User doesn't exist yet. 
        -- The actual invitation (creating auth.users entry) must be done via Edge Function 
        -- or Admin SDK because SQL cannot easily call auth.invite_user_by_email without 
        -- complex setup.
        
        RETURN jsonb_build_object('success', false, 'status', 'needs_invite', 'message', 'User not found in auth.users. Please use the invite-school-admin Edge Function.');
    END IF;
END;
$$;
