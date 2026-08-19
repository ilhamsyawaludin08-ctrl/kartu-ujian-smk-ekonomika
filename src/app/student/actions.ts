'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { StudentExamCardData } from '@/types/student';

export interface BasicStudentData {
  nisn: string;
  name: string;
  className: string;
  major: string;
  examNumber?: string | null;
}

export type CardActionResponse = 
  | { success: true; data: StudentExamCardData }
  | { success: false; error: 'not_found' | 'pending' | 'server_error'; message?: string; student?: BasicStudentData };

export async function fetchStudentCardData(nisn: string): Promise<CardActionResponse> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'server_error', message: 'Kunci SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local. Wajib ditambahkan agar sistem bisa membaca data.' };
    }

    const supabase = createAdminClient();

    // 1. Ambil data siswa
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, classes(class_name, major)')
      .eq('nisn', nisn)
      .single();

    if (studentError || !student) {
      return { success: false, error: 'not_found', message: 'Data siswa dengan NISN tersebut tidak ditemukan.' };
    }

    const basicStudentData: BasicStudentData = {
      nisn: student.nisn,
      name: student.name,
      className: student.classes?.class_name || '-',
      major: student.classes?.major || '-',
      examNumber: null,
    };

    // 2. Cek approval status
    if (student.approval_status === 'Pending') {
      return { success: false, error: 'pending', student: basicStudentData };
    }

    // 3. Dapatkan ujian yang sedang aktif
    const { data: activeExam, error: examError } = await supabase
      .from('exams')
      .select('id')
      .eq('is_active', true)
      .single();

    if (examError || !activeExam) {
      return { success: false, error: 'server_error', message: 'Belum ada ujian aktif.', student: basicStudentData };
    }

    // 4. Cek exam_cards untuk ujian aktif tersebut
    const { data: examCard, error: cardError } = await supabase
      .from('exam_cards')
      .select('*')
      .eq('student_id', student.id)
      .eq('exam_id', activeExam.id)
      .eq('status', 'ACTIVE')
      .single();

    if (cardError || !examCard) {
      return { success: false, error: 'server_error', message: 'Kartu ujian belum diterbitkan untuk periode aktif ini.', student: basicStudentData };
    }

    basicStudentData.examNumber = examCard.card_number;

    // 5. Ambil data relasi lainnya secara paralel
    const [
      classRes,
      examRes,
      schedulesRes,
      settingsRes,
      schoolRes
    ] = await Promise.all([
      supabase.from('classes').select('*').eq('id', student.class_id).single(),
      supabase.from('exams').select('*').eq('id', examCard.exam_id).single(),
      supabase.from('schedules').select('*').eq('class_id', student.class_id).eq('exam_id', examCard.exam_id).eq('is_active', true),
      supabase.from('exam_settings').select('*').eq('exam_id', examCard.exam_id).maybeSingle(),
      supabase.from('school_profile').select('*').limit(1).maybeSingle()
    ]);

    if (classRes.error || examRes.error) {
      console.error("Error fetching related data", {
        class: classRes.error,
        exam: examRes.error,
      });
      return { success: false, error: 'server_error', message: 'Gagal mengambil data lengkap' };
    }

    if (!schedulesRes.data || schedulesRes.data.length === 0) {
      return { success: false, error: 'server_error', message: `Jadwal ujian untuk kelas ${classRes.data?.class_name || 'ini'} belum tersedia.` };
    }

    const data: StudentExamCardData = {
      student: {
        id: student.id,
        nisn: student.nisn,
        full_name: student.name,
        photo_url: student.photo_url,
        class_id: student.class_id,
        approval_status: student.approval_status,
      },
      classInfo: {
        id: classRes.data.id,
        class_name: classRes.data.class_name,
        major: classRes.data.major,
      },
      exam: {
        id: examRes.data.id,
        exam_name: examRes.data.name,
        academic_year: examRes.data.academic_year,
        semester: examRes.data.semester,
        server_url: examRes.data.server_url || null,
      },
      schedules: schedulesRes.data || [],
      examSettings: {
        id: settingsRes.data?.id || 0,
        card_title: settingsRes.data?.card_title || 'KARTU PESERTA UJIAN',
        show_photo: settingsRes.data?.show_photo ?? true,
        show_room: settingsRes.data?.show_room ?? true,
        show_schedule: settingsRes.data?.show_schedule ?? true,
        allow_download: settingsRes.data?.allow_download ?? true,
        allow_print: settingsRes.data?.allow_print ?? true,
        chairperson_name: settingsRes.data?.chairperson_name || 'Panitia Ujian',
        exam_notes: settingsRes.data?.exam_notes || 'Kartu ini wajib dibawa saat mengikuti ujian.',
      },
      schoolProfile: {
        id: schoolRes.data?.id || 0,
        school_name: schoolRes.data?.school_name || 'SMK Ekonomika',
        npsn: schoolRes.data?.npsn || '-',
        address: schoolRes.data?.address || '-',
        logo_url: schoolRes.data?.logo_url || null,
      },
      examCard: {
        id: examCard.id,
        card_number: examCard.card_number,
        is_active: examCard.status === 'ACTIVE',
      }
    };

    return { success: true, data };

  } catch (error: any) {
    console.error("Server Action Error:", error);
    return { success: false, error: 'server_error', message: error.message || 'Terjadi kesalahan sistem yang tidak terduga.' };
  }
}
