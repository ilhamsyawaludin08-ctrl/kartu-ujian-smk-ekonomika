'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return {
    email: user.email,
    id: user.id,
    role: user.app_metadata?.role || 'Administrator',
    fullName: user.user_metadata?.full_name || 'Admin TU',
    username: user.user_metadata?.username || 'admin',
  };
}
