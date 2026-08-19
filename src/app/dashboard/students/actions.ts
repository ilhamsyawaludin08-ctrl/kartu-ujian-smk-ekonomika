'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStudents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('students')
    .select('*, classes:class_id(*)');

  if (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function getClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('classes').select('*');
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  
  const nisn = formData.get('nisn') as string;
  const name = formData.get('name') as string;
  const class_id = formData.get('class_id') as string;
  const place_of_birth = formData.get('place_of_birth') as string;
  const date_of_birth = formData.get('date_of_birth') as string || null;
  const exam_number = formData.get('exam_number') as string;
  const exam_room = formData.get('exam_room') as string;
  const exam_password = formData.get('exam_password') as string;

  let photo_url = null;
  const photo = formData.get('photo') as File | null;
  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop();
    const fileName = `${nisn}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('student-photos').upload(fileName, photo);
    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('student-photos').getPublicUrl(uploadData.path);
      photo_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase.from('students').insert({
    nisn,
    name,
    class_id: parseInt(class_id),
    place_of_birth,
    date_of_birth,
    exam_number,
    exam_room,
    exam_password,
    photo_url,
    approval_status: 'Pending'
  });

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function updateStudent(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const nisn = formData.get('nisn') as string;
  const name = formData.get('name') as string;
  const class_id = formData.get('class_id') as string;
  const place_of_birth = formData.get('place_of_birth') as string;
  const date_of_birth = formData.get('date_of_birth') as string || null;
  const exam_number = formData.get('exam_number') as string;
  const exam_room = formData.get('exam_room') as string;
  const exam_password = formData.get('exam_password') as string;

  let updateData: any = {
    nisn,
    name,
    class_id: parseInt(class_id),
    place_of_birth,
    date_of_birth,
    exam_number,
    exam_room,
    exam_password
  };

  const photo = formData.get('photo') as File | null;
  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop();
    const fileName = `${nisn}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('student-photos').upload(fileName, photo);
    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('student-photos').getPublicUrl(uploadData.path);
      updateData.photo_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase.from('students').update(updateData).eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function deleteStudent(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('students').delete().eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/students');
  return { success: true };
}

// Logic Approval & Generate Card Number
export async function approveStudent(studentId: number) {
  const supabase = await createClient();

  // 1. Update status student
  const { error: updateError } = await supabase
    .from('students')
    .update({ approval_status: 'Approved' })
    .eq('id', studentId);

  if (updateError) return { success: false, error: updateError.message };

  // 2. Cek ujian aktif
  const { data: activeExam, error: examError } = await supabase
    .from('exams')
    .select('*')
    .eq('is_active', true)
    .single();

  if (examError || !activeExam) {
    // Jika tidak ada ujian aktif, kita hanya meng-approve siswa, tapi belum bisa membuat kartu.
    revalidatePath('/dashboard/students');
    return { success: true, warning: 'Siswa diapprove, tapi tidak ada ujian aktif sehingga kartu belum dibuat.' };
  }

  // 3. Cek apakah kartu sudah pernah dibuat untuk siswa & ujian ini
  const { data: existingCard } = await supabase
    .from('exam_cards')
    .select('id')
    .eq('student_id', studentId)
    .eq('exam_id', activeExam.id)
    .single();

  if (!existingCard) {
    // Generate card number
    // Format: EKM-[KODE_UJIAN]-[TAHUN]-[NOMOR_URUT]
    // KODE_UJIAN: ambil kata pertama atau uppercase dari exam name (contoh 'PSAT' dari 'PSAT 2026')
    const examCode = activeExam.name.split(' ')[0].toUpperCase();
    
    // TAHUN: ambil 4 digit tahun dari academic_year (contoh '2025/2026' -> '2026' atau '2025')
    // Kita ambil bagian depan saja biar konsisten, misalnya '2025'
    const tahun = activeExam.academic_year.substring(0, 4);

    // NOMOR URUT: Hitung jumlah kartu yang ada di exam ini
    const { count } = await supabase
      .from('exam_cards')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', activeExam.id);

    const urut = (count || 0) + 1;
    const urutStr = urut.toString().padStart(5, '0');
    
    const cardNumber = `EKM-${examCode}-${tahun}-${urutStr}`;

    const { error: insertError } = await supabase.from('exam_cards').insert({
      student_id: studentId,
      exam_id: activeExam.id,
      card_number: cardNumber,
      status: 'ACTIVE'
    });

    if (insertError) {
      console.error('Failed to create exam card:', insertError);
      return { success: false, error: 'Siswa diapprove, tapi gagal men-generate nomor kartu.' };
    }
  } else {
    // Jika sudah ada kartu, aktifkan kembali
    await supabase.from('exam_cards').update({ status: 'ACTIVE' }).eq('id', existingCard.id);
  }

  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function setPendingStudent(studentId: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('students')
    .update({ approval_status: 'Pending' })
    .eq('id', studentId);

  if (error) return { success: false, error: error.message };

  // Nonaktifkan kartu ujian yang ada
  await supabase
    .from('exam_cards')
    .update({ status: 'INACTIVE' })
    .eq('student_id', studentId);

  revalidatePath('/dashboard/students');
  return { success: true };
}

export async function bulkImportStudents(data: any[]) {
  const supabase = await createClient();

  const { data: existingClasses } = await supabase.from('classes').select('*');
  const classMap = new Map();
  existingClasses?.forEach(c => classMap.set(c.class_name.toUpperCase(), c.id));

  const classesToCreate = new Set<string>();
  data.forEach(row => {
    if (row.class_name) {
      const className = row.class_name.toString().trim().toUpperCase();
      if (!classMap.has(className)) {
        classesToCreate.add(className);
      }
    }
  });

  for (const className of classesToCreate) {
    const parts = className.split(' ');
    const grade = parts[0] || 'X';
    const major = parts.length > 2 ? parts.slice(1, -1).join(' ') : (parts[1] || 'UMUM');

    const { data: newClass, error: classError } = await supabase.from('classes').insert({ 
      class_name: className, 
      grade: grade,
      major: major,
      academic_year: '2025/2026'
    }).select('id').single();
    
    if (classError) {
      return { success: false, error: `Gagal membuat kelas otomatis untuk ${className}: ${classError.message}` };
    }

    if (newClass) {
      classMap.set(className, newClass.id);
    }
  }

  const insertData = data.filter(r => r.nisn && r.name).map(r => ({
    nisn: r.nisn.toString().trim(),
    name: r.name.toString().trim(),
    class_id: r.class_name ? classMap.get(r.class_name.toString().trim().toUpperCase()) : null,
    approval_status: 'Pending'
  }));

  if (insertData.length === 0) return { success: false, error: 'Tidak ada data valid untuk diimport.' };

  const nisns = insertData.map(d => d.nisn);
  const { data: existingStudents } = await supabase.from('students').select('nisn').in('nisn', nisns);
  const existingNisns = new Set(existingStudents?.map(s => s.nisn) || []);

  const newStudents = insertData.filter(d => !existingNisns.has(d.nisn));

  if (newStudents.length > 0) {
    const { error: insertError } = await supabase.from('students').insert(newStudents);
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath('/dashboard/students');
  return { success: true };
}
