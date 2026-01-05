import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"; // Verified imports
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_DAILY_NOTIFICATIONS = 3;

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Create client with Auth Context
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
        );

        // Admin client for privileged operations (fetching subs)
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { title, body, url, target_criteria } = await req.json();

        // 1. Identify Sender & Role
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) throw new Error("Unauthorized");

        // Fetch User Role from DB
        const { data: userRoleData, error: roleError } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .single();

        // Default to checking partners table if role table empty (backward compatibility) or assume STUDENT
        const role = userRoleData?.role;

        // Validation: Must be PARTNER/STORE_ADMIN or ADMIN/SCHOOL_ADMIN
        const isPartner = role === 'STORE_ADMIN' || role === 'STORE' || role === 'PARTNER'; // Check mapping with types.ts
        const isAdmin = role === 'ADMIN' || role === 'SCHOOL_ADMIN';

        // Check legacy partner table logic if needed, but PREFER role check
        let partnerId = null;
        let partnerName = '';

        if (isPartner) {
            const { data: partner } = await supabaseAdmin
                .from('partners')
                .select('id, name')
                .eq('adminUserId', user.id)
                .single();
            if (partner) {
                partnerId = partner.id;
                partnerName = partner.name;
            }
        }

        if (!isPartner && !isAdmin) {
            return new Response(JSON.stringify({ error: "Forbidden: insufficient permissions" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const senderId = partnerId || user.id;

        // 2. Rate Limit (Only for Partners)
        if (isPartner) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count, error: countError } = await supabaseAdmin
                .from('push_notifications')
                .select('*', { count: 'exact', head: true })
                .eq('sender_id', senderId)
                .gte('created_at', today.toISOString());

            if (countError) throw countError;

            if ((count || 0) >= MAX_DAILY_NOTIFICATIONS) {
                return new Response(JSON.stringify({ error: `Daily limit reached (${MAX_DAILY_NOTIFICATIONS} notifications/day)` }), {
                    status: 429,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }
        }

        // 3. Fetch Subscriptions
        let query = supabaseAdmin.from("push_subscriptions").select("endpoint, keys, user_id");

        // Filter by criteria
        // e.g. target_criteria: { userIds: ['...'] } or { schoolId: '...' }
        if (target_criteria?.userIds && Array.isArray(target_criteria.userIds)) {
            query = query.in("user_id", target_criteria.userIds);
        }
        // If Partner, maybe only send to students who have validated recently? 
        // For now, allow sending to all (dangerous but requested) or let frontend filter IDs.

        const { data: subscriptions, error: subError } = await query;
        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({ message: "No subscriptions found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 4. Configure Web Push
        const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
        const vapidPublicKey = Deno.env.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY") || "BABM4FgQpGsFpl0nMFeY5rGmsvHlFzD8M_b8PqwngcLfSzWCvGyKmmfphydAo";
        const subject = "mailto:contato@unipass.com.br";

        if (!vapidPrivateKey) throw new Error("Missing VAPID_PRIVATE_KEY");

        webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);

        // 5. Send Notifications
        const payload = JSON.stringify({
            title,
            body: isPartner ? `${partnerName}: ${body}` : body,
            url,
            icon: "/pwa-icon.svg"
        });

        const results = await Promise.allSettled(
            subscriptions.map((sub: any) =>
                webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: sub.keys },
                    payload
                )
            )
        );

        const successCount = results.filter((r: PromiseSettledResult<any>) => r.status === "fulfilled").length;

        // 6. Log Notification
        await supabaseAdmin.from('push_notifications').insert({
            sender_id: senderId,
            title,
            body,
            url,
            target_criteria,
            sent_count: successCount
        });

        return new Response(
            JSON.stringify({
                success: true,
                sent: successCount
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
