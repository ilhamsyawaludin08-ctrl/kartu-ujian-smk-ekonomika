'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subjects:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const teacher_name = formData.get('teacher_name') as string;

  const { error } = await supabase.from('subjects').insert({
    name,
    teacher_name
  });

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/subjects');
  revalidatePath('/dashboard/schedules');
  return { success: true };
}

export async function updateSubject(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const teacher_name = formData.get('teacher_name') as string;

  const { error } = await supabase.from('subjects').update({
    name,
    teacher_name
  }).eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/subjects');
  revalidatePath('/dashboard/schedules');
  return { success: true };
}

export async function deleteSubject(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('subjects').delete().eq('id', id);

  if (error) {
    if (error.code === '23503') {
       return { success: false, error: 'Tidak dapat menghapus mata pelajaran karena data ini sedang digunakan di Jadwal Ujian.' };
    }
    return { success: false, error: error.message };
  }
  
  revalidatePath('/dashboard/subjects');
  revalidatePath('/dashboard/schedules');
  return { success: true };
}

export async function bulkImportSubjects(data: any[]) {
  const supabase = await createClient();

  const insertData = data.map(r => ({
    name: r.name ? r.name.toString().trim() : '',
    teacher_name: r.teacher_name ? r.teacher_name.toString().trim() : ''
  })).filter(r => r.name);

  if (insertData.length === 0) return { success: false, error: 'Tidak ada data valid untuk diimport.' };

  const { error: insertError } = await supabase.from('subjects').insert(insertData);
  if (insertError) return { success: false, error: insertError.message };

  revalidatePath('/dashboard/subjects');
  revalidatePath('/dashboard/schedules');
  return { success: true };
}
