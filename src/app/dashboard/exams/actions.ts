'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ensureActiveCards } from '@/lib/examCards';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getExams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exams')
    .select('*, exam_settings(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching exams:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}

const MAX_ACTIVE_EXAMS = 4;
const MAX_ACTIVE_ERROR = `Maksimal ${MAX_ACTIVE_EXAMS} ujian dapat aktif bersamaan. Nonaktifkan salah satu ujian aktif terlebih dahulu.`;

// Cek apakah jumlah ujian aktif (selain ujian ini) sudah mencapai batas maksimal
async function isActiveLimitReached(supabase: SupabaseClient, excludeExamId?: number): Promise<{ reached: boolean; error?: string }> {
  let query = supabase.from('exams').select('id', { count: 'exact', head: true }).eq('is_active', true);
  if (excludeExamId) query = query.neq('id', excludeExamId);

  const { count, error } = await query;
  if (error) return { reached: false, error: error.message };
  return { reached: (count || 0) >= MAX_ACTIVE_EXAMS };
}

// Saat ujian menjadi aktif: siswa yang sudah Approved otomatis dapat kartu ACTIVE untuk ujian ini
async function activateCardsForApprovedStudents(supabase: SupabaseClient, examId: number): Promise<{ error?: string }> {
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('id, name, academic_year')
    .eq('id', examId)
    .single();
  if (examError || !exam) return { error: examError?.message || 'Ujian tidak ditemukan.' };

  const students: { id: number; exam_number: string | null }[] = [];
  const PAGE_SIZE = 1000;
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('students')
      .select('id, exam_number')
      .eq('approval_status', 'Approved')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { error: error.message };
    students.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }

  return ensureActiveCards(supabase, exam, students);
}

const CARD_ERROR_PREFIX = 'Ujian berhasil disimpan, tetapi gagal membuat kartu untuk siswa yang sudah Approved: ';

export async function createExam(formData: FormData) {
  const supabase = await createClient();
  
  const is_active = formData.get('is_active') === 'true';

  if (is_active) {
    const limit = await isActiveLimitReached(supabase);
    if (limit.error) return { success: false, error: limit.error };
    if (limit.reached) return { success: false, error: MAX_ACTIVE_ERROR };
  }

  // Insert Exam
  const examData = {
    name: formData.get('name') as string,
    academic_year: formData.get('academic_year') as string,
    semester: formData.get('semester') as string,
    school_name: formData.get('school_name') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    server_url: formData.get('server_url') as string,
    is_active
  };

  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert(examData)
    .select()
    .single();

  if (examError) return { success: false, error: examError.message };

  // Handle signature upload
  let signature_url = null;
  const signature = formData.get('signature') as File | null;
  if (signature && signature.size > 0) {
    const fileExt = signature.name.split('.').pop();
    const fileName = `${exam.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('signatures').upload(fileName, signature);
    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('signatures').getPublicUrl(uploadData.path);
      signature_url = publicUrlData.publicUrl;
    }
  }

  // Insert Settings
  const settingsData = {
    exam_id: exam.id,
    card_title: formData.get('card_title') as string,
    chairperson_name: formData.get('chairperson_name') as string || null,
    signature_url,
    exam_notes: formData.get('exam_notes') as string || null,
    show_photo: formData.get('show_photo') === 'true',
    show_room: formData.get('show_room') === 'true',
    show_schedule: formData.get('show_schedule') === 'true',
    show_password: formData.get('show_password') === 'true',
    allow_print: formData.get('allow_print') === 'true',
    allow_download: formData.get('allow_download') === 'true',
  };

  const { error: settingsError } = await supabase.from('exam_settings').insert(settingsData);

  if (settingsError) return { success: false, error: settingsError.message };

  if (is_active) {
    const cardRes = await activateCardsForApprovedStudents(supabase, exam.id);
    if (cardRes.error) {
      revalidatePath('/dashboard/exams');
      revalidatePath('/dashboard/students');
      return { success: false, error: CARD_ERROR_PREFIX + cardRes.error };
    }
  }
  
  revalidatePath('/dashboard/exams');
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function updateExam(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const { data: oldExam } = await supabase.from('exams').select('is_active').eq('id', id).single();
  const is_active = formData.get('is_active') === 'true';
  const becameActive = is_active && !oldExam?.is_active;

  if (becameActive) {
    const limit = await isActiveLimitReached(supabase, id);
    if (limit.error) return { success: false, error: limit.error };
    if (limit.reached) return { success: false, error: MAX_ACTIVE_ERROR };
  }

  // Update Exam
  const examData = {
    name: formData.get('name') as string,
    academic_year: formData.get('academic_year') as string,
    semester: formData.get('semester') as string,
    school_name: formData.get('school_name') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    server_url: formData.get('server_url') as string,
    is_active
  };

  const { error: examError } = await supabase.from('exams').update(examData).eq('id', id);

  if (examError) return { success: false, error: examError.message };

  // Propagasi status ke schedules milik ujian ini
  await supabase.from('schedules').update({ is_active }).eq('exam_id', id);

  // Handle signature upload
  let signature_url = undefined;
  const signature = formData.get('signature') as File | null;
  if (signature && signature.size > 0) {
    const fileExt = signature.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('signatures').upload(fileName, signature);
    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('signatures').getPublicUrl(uploadData.path);
      signature_url = publicUrlData.publicUrl;
    }
  }

  // Update Settings
  const settingsData: any = {
    card_title: formData.get('card_title') as string,
    chairperson_name: formData.get('chairperson_name') as string || null,
    exam_notes: formData.get('exam_notes') as string || null,
    show_photo: formData.get('show_photo') === 'true',
    show_room: formData.get('show_room') === 'true',
    show_schedule: formData.get('show_schedule') === 'true',
    show_password: formData.get('show_password') === 'true',
    allow_print: formData.get('allow_print') === 'true',
    allow_download: formData.get('allow_download') === 'true',
  };

  if (signature_url !== undefined) {
    settingsData.signature_url = signature_url;
  }

  // Check if settings exist, if not insert
  const { data: existingSettings } = await supabase.from('exam_settings').select('id').eq('exam_id', id).single();

  if (existingSettings) {
    const { error: settingsError } = await supabase.from('exam_settings').update(settingsData).eq('exam_id', id);
    if (settingsError) return { success: false, error: settingsError.message };
  } else {
    const { error: settingsError } = await supabase.from('exam_settings').insert({ exam_id: id, ...settingsData });
    if (settingsError) return { success: false, error: settingsError.message };
  }

  if (becameActive) {
    const cardRes = await activateCardsForApprovedStudents(supabase, id);
    if (cardRes.error) {
      revalidatePath('/dashboard/exams');
      revalidatePath('/dashboard/students');
      return { success: false, error: CARD_ERROR_PREFIX + cardRes.error };
    }
  }
  
  revalidatePath('/dashboard/exams');
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function toggleExamStatus(id: number, currentStatus: boolean) {
  const supabase = await createClient();
  const newStatus = !currentStatus;
  
  if (newStatus) {
    const limit = await isActiveLimitReached(supabase, id);
    if (limit.error) return { success: false, error: limit.error };
    if (limit.reached) return { success: false, error: MAX_ACTIVE_ERROR };
  }

  const { error } = await supabase.from('exams').update({ is_active: newStatus }).eq('id', id);
  if (error) return { success: false, error: error.message };
  
  // Propagasi status ke schedules milik ujian ini
  await supabase.from('schedules').update({ is_active: newStatus }).eq('exam_id', id);

  if (newStatus) {
    const cardRes = await activateCardsForApprovedStudents(supabase, id);
    if (cardRes.error) {
      revalidatePath('/dashboard/exams');
      revalidatePath('/dashboard/students');
      return { success: false, error: 'Ujian berhasil diaktifkan, tetapi gagal membuat kartu untuk siswa yang sudah Approved: ' + cardRes.error };
    }
  }

  revalidatePath('/dashboard/exams');
  revalidatePath('/dashboard/students');
  return { success: true };
}

// Reset manual oleh TU: semua siswa jadi Pending & semua kartu ujian dinonaktifkan
export async function resetAllStudentsToPending() {
  const supabase = await createClient();

  const { error: studentError } = await supabase
    .from('students')
    .update({ approval_status: 'Pending' })
    .neq('approval_status', 'Pending');
  if (studentError) return { success: false, error: studentError.message };

  const { error: cardError } = await supabase
    .from('exam_cards')
    .update({ status: 'INACTIVE' })
    .neq('status', 'INACTIVE');
  if (cardError) return { success: false, error: cardError.message };

  revalidatePath('/dashboard/exams');
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function deleteExam(id: number) {
  const supabase = await createClient();
  
  // Periksa relasi
  const { count: scheduleCount } = await supabase.from('schedules').select('id', { count: 'exact', head: true }).eq('exam_id', id);
  const { count: cardCount } = await supabase.from('exam_cards').select('id', { count: 'exact', head: true }).eq('exam_id', id);

  if ((scheduleCount && scheduleCount > 0) || (cardCount && cardCount > 0)) {
    return { success: false, error: 'Tidak dapat menghapus ujian ini karena sudah memiliki jadwal atau kartu peserta yang terkait.' };
  }

  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/exams');
  return { success: true };
}
