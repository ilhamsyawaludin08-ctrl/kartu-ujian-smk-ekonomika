'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSchedules() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('schedules')
    .select('*, exams:exam_id(*), classes:class_id(*)')
    .order('exam_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedules:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}

export async function getExams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('class_name', { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createSchedule(formData: FormData) {
  const supabase = await createClient();
  
  const exam_id = formData.get('exam_id') as string;
  const class_id = formData.get('class_id') as string;
  const subject = formData.get('subject') as string;
  const exam_date = formData.get('exam_date') as string;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const room = formData.get('room') as string;
  const is_active = formData.get('is_active') === 'true';

  const { error } = await supabase.from('schedules').insert({
    exam_id: parseInt(exam_id),
    class_id: parseInt(class_id),
    subject,
    exam_date,
    start_time,
    end_time,
    room: room || null,
    is_active
  });

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/schedules');
  return { success: true };
}

export async function createBulkSchedules(exam_id: number, class_id: number, schedules: any[]) {
  const supabase = await createClient();
  
  const insertData = schedules.map(s => ({
    exam_id,
    class_id,
    subject: s.subject,
    exam_date: s.exam_date,
    start_time: s.start_time,
    end_time: s.end_time,
    room: s.room || null,
    is_active: s.is_active
  }));

  const { error } = await supabase.from('schedules').insert(insertData);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/schedules');
  return { success: true };
}

export async function updateSchedule(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const exam_id = formData.get('exam_id') as string;
  const class_id = formData.get('class_id') as string;
  const subject = formData.get('subject') as string;
  const exam_date = formData.get('exam_date') as string;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const room = formData.get('room') as string;
  const is_active = formData.get('is_active') === 'true';

  const { error } = await supabase.from('schedules').update({
    exam_id: parseInt(exam_id),
    class_id: parseInt(class_id),
    subject,
    exam_date,
    start_time,
    end_time,
    room: room || null,
    is_active
  }).eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/schedules');
  return { success: true };
}

export async function deleteSchedule(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('schedules').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/dashboard/schedules');
  return { success: true };
}
