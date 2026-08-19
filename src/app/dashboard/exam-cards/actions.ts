'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchApprovedStudents(query: string) {
  if (!query) return { success: true, data: [] };
  
  const supabase = await createClient();
  
  // Search students that are Approved
  const { data, error } = await supabase
    .from('students')
    .select(`
      id, nisn, full_name:name, class_id, classes(class_name)
    `)
    .eq('approval_status', 'Approved')
    .or(`name.ilike.%${query}%,nisn.ilike.%${query}%`)
    .limit(20);

  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}
