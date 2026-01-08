import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore: Deno handles URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Silence IDE errors for Deno environment in non-Deno context
declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // 1. Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Manual Auth Verification (Safe to disable "Enforce JWT" in Gateway)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Create client with user's token to verify identity
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            console.log('Auth Error:', userError);
            return new Response(JSON.stringify({
                error: 'Unauthorized: Manual Verification Failed',
                details: userError?.message || 'No user found',
                receivedHeaderPrefix: authHeader.substring(0, 10) + '...'
            }), {
                status: 403, // Changed to 403 to distinguish from Gateway 401
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { schoolId, email, schoolName } = await req.json();

        // Use Service Role Key for administrative tasks
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 3. Invite User with Metadata (Helper for triggers)
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                school_id: schoolId,
                full_name: `Admin ${schoolName}`,
                role: 'SCHOOL_ADMIN'
            },
            redirectTo: `${req.headers.get('origin')}/onboarding`
        });

        if (inviteError) throw inviteError;

        // 4. Create/Update Profile & Role explicitly
        const userId = inviteData.user.id;
        console.log('Invited User ID:', userId);

        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: userId,
            full_name: `Admin ${schoolName}`,
            role: 'SCHOOL_ADMIN',
            school_id: schoolId
        });

        if (profileError) {
            console.error('Profile Upsert Error:', profileError);
            // Check if error is due to missing school (constraint violation)
            if (profileError.code === '23503') { // Foreign key violation
                return new Response(JSON.stringify({ error: 'School ID invalid or not found' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        const { error: roleError } = await supabaseAdmin.from('user_roles').upsert({
            id: userId,
            role: 'SCHOOL_ADMIN'
        });

        if (roleError) console.error('Role Upsert Error:', roleError);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
