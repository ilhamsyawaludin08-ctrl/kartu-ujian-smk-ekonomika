import { createClient } from '@supabase/supabase-js';

// Pastikan key ini disediakan di .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing in .env.local. Admin operations bypassing RLS will fail.");
}

export const createAdminClient = () => {
  return createClient(supabaseUrl || 'https://dummy.supabase.co', supabaseServiceKey || 'dummy-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
