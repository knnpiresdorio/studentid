import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
    const { schoolId, email, schoolName } = await req.json();

    // Use Service Role Key for administrative tasks
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        // 1. Invite User
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { school_id: schoolId },
            redirectTo: `${req.headers.get('origin')}/onboarding`
        });

        if (inviteError) throw inviteError;

        // 2. Create/Update Profile & Role
        const userId = inviteData.user.id;

        // Profiles
        await supabaseAdmin.from('profiles').upsert({
            id: userId,
            full_name: `Admin ${schoolName}`,
            role: 'SCHOOL_ADMIN',
            school_id: schoolId
        });

        // Roles
        await supabaseAdmin.from('user_roles').upsert({
            id: userId,
            role: 'SCHOOL_ADMIN'
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
