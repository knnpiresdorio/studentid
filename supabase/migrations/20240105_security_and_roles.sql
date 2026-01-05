-- 1. Create User Roles table for RBAC
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'STORE', 'STORE_ADMIN', 'ADMIN', 'SCHOOL_ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can read own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Service Role (Admin) has full access (Implicit in Supabase, but good to note)

-- 2. Secure Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage ONLY their own subscriptions
CREATE POLICY "Users manage own subscriptions" 
ON public.push_subscriptions FOR ALL 
USING (auth.uid() = user_id);

-- 3. Secure Push Notifications Logs
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null if system
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    target_criteria JSONB,
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Senders can view their own logs
CREATE POLICY "Senders view own logs" 
ON public.push_notifications FOR SELECT 
USING (auth.uid() = sender_id);

-- Policy: Admins can view all (requires custom claim or separate admin client usage)

-- 4. Partner Rate Limiting Index
CREATE INDEX IF NOT EXISTS idx_push_notifications_sender_date 
ON public.push_notifications (sender_id, created_at);
