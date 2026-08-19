'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getClassesWithCount() {
  const supabase = await createClient();
  
  // Mengambil kelas dan menghitung jumlah siswa secara paralel atau lewat query join
  // Supabase postgREST mendukung relasi hitungan: students(count)
  const { data, error } = await supabase
    .from('classes')
    .select('*, students(count)')
    .order('grade', { ascending: true })
    .order('major', { ascending: true })
    .order('class_name', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}

export async function createClass(formData: FormData) {
  const supabase = await createClient();
  
  const grade = formData.get('grade') as string;
  const major = formData.get('major') as string;
  const class_name = formData.get('class_name') as string;
  const academic_year = formData.get('academic_year') as string;

  const { error } = await supabase.from('classes').insert({
    grade,
    major,
    class_name,
    academic_year
  });

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/classes');
  return { success: true };
}

export async function updateClass(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const grade = formData.get('grade') as string;
  const major = formData.get('major') as string;
  const class_name = formData.get('class_name') as string;
  const academic_year = formData.get('academic_year') as string;

  const { error } = await supabase.from('classes').update({
    grade,
    major,
    class_name,
    academic_year
  }).eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/classes');
  // Update students if they cache class data, just to be safe
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function deleteClass(id: number) {
  const supabase = await createClient();
  
  // Periksa apakah kelas ini masih memiliki siswa (sebagai tindakan pencegahan ekstra)
  const { count, error: countError } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', id);

  if (countError) return { success: false, error: 'Gagal memvalidasi data siswa terkait kelas ini.' };
  
  if (count && count > 0) {
    return { 
      success: false, 
      error: `Tidak dapat menghapus kelas karena masih ada ${count} siswa yang terdaftar di kelas ini. Pindahkan atau hapus siswa tersebut terlebih dahulu.` 
    };
  }
  
  const { error } = await supabase.from('classes').delete().eq('id', id);

  if (error) {
    // Jika FK constraint error dari DB
    if (error.code === '23503') {
       return { success: false, error: 'Tidak dapat menghapus kelas karena data ini sedang digunakan di tabel lain (contoh: Jadwal Ujian).' };
    }
    return { success: false, error: error.message };
  }
  
  revalidatePath('/dashboard/classes');
  return { success: true };
}
