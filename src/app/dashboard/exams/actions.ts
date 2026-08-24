'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

async function deactivateOtherExams(supabase: any, currentExamId?: number) {
  let examQuery = supabase.from('exams').update({ is_active: false }).neq('is_active', false);
  let scheduleQuery = supabase.from('schedules').update({ is_active: false }).neq('is_active', false);
  
  if (currentExamId) {
    examQuery = examQuery.neq('id', currentExamId);
    scheduleQuery = scheduleQuery.neq('exam_id', currentExamId);
  }
  
  await Promise.all([examQuery, scheduleQuery]);
}

export async function createExam(formData: FormData) {
  const supabase = await createClient();
  
  const is_active = formData.get('is_active') === 'true';

  if (is_active) {
    await deactivateOtherExams(supabase);
    // Reset semua siswa menjadi Pending untuk ujian baru yang diaktifkan
    await supabase.from('students').update({ approval_status: 'Pending' }).neq('approval_status', 'Pending');
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
    allow_print: formData.get('allow_print') === 'true',
    allow_download: formData.get('allow_download') === 'true',
  };

  const { error: settingsError } = await supabase.from('exam_settings').insert(settingsData);

  if (settingsError) return { success: false, error: settingsError.message };
  
  revalidatePath('/dashboard/exams');
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function updateExam(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const { data: oldExam } = await supabase.from('exams').select('is_active').eq('id', id).single();
  const is_active = formData.get('is_active') === 'true';

  if (is_active) {
    await deactivateOtherExams(supabase, id);
    // Jika ujian ini sebelumnya tidak aktif dan sekarang diaktifkan, reset status siswa
    if (!oldExam?.is_active) {
      await supabase.from('students').update({ approval_status: 'Pending' }).neq('approval_status', 'Pending');
    }
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
  
  revalidatePath('/dashboard/exams');
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function toggleExamStatus(id: number, currentStatus: boolean) {
  const supabase = await createClient();
  const newStatus = !currentStatus;
  
  if (newStatus) {
    // If we are activating this exam, deactivate others and their schedules
    await deactivateOtherExams(supabase, id);
    // Reset semua siswa menjadi Pending untuk ujian yang baru diaktifkan
    await supabase.from('students').update({ approval_status: 'Pending' }).neq('approval_status', 'Pending');
  }

  const { error } = await supabase.from('exams').update({ is_active: newStatus }).eq('id', id);
  if (error) return { success: false, error: error.message };
  
  // Propagasi status ke schedules milik ujian ini
  await supabase.from('schedules').update({ is_active: newStatus }).eq('exam_id', id);

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
