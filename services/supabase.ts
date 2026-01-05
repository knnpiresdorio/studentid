
import { createClient } from '@supabase/supabase-js';

// Credentials provided for the integration
const SUPABASE_URL = 'https://cwbvpwekuburfyktpxlt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Pxm2g7lBe59QAL0IDMfxwQ_KuX-g5Jg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
