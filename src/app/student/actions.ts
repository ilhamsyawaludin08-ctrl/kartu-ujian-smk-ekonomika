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

export interface StudentExamOption {
  examId: number;
  cardTitle: string;
  examName: string;
  cardNumber: string;
}

type ErrorResponse = { success: false; error: 'not_found' | 'pending' | 'server_error'; message?: string; student?: BasicStudentData };

export type CardActionResponse = 
  | { success: true; data: StudentExamCardData }
  | ErrorResponse;

export type ExamListResponse =
  | { success: true; student: BasicStudentData; exams: StudentExamOption[] }
  | ErrorResponse;

const MISSING_KEY_MESSAGE = 'Kunci SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local. Wajib ditambahkan agar sistem bisa membaca data.';

// Ambil data siswa + cek approval (dipakai oleh daftar ujian & detail kartu)
async function loadApprovedStudent(supabase: ReturnType<typeof createAdminClient>, nisn: string) {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, classes(class_name, major)')
    .eq('nisn', nisn)
    .single();

  if (studentError || !student) {
    return { error: { success: false, error: 'not_found', message: 'Data siswa dengan NISN tersebut tidak ditemukan.' } as ErrorResponse };
  }

  const basicStudentData: BasicStudentData = {
    nisn: student.nisn,
    name: student.name,
    className: student.classes?.class_name || '-',
    major: student.classes?.major || '-',
    examNumber: null,
  };

  if (student.approval_status === 'Pending') {
    return { error: { success: false, error: 'pending', student: basicStudentData } as ErrorResponse };
  }

  return { student, basicStudentData };
}

/**
 * Daftar ujian yang valid untuk siswa:
 * ujian aktif + kartu ACTIVE milik siswa + kelas siswa punya jadwal aktif di ujian tsb.
 */
export async function fetchStudentCardData(nisn: string): Promise<ExamListResponse> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'server_error', message: MISSING_KEY_MESSAGE };
    }

    const supabase = createAdminClient();

    // 1 & 2. Data siswa + cek approval
    const loaded = await loadApprovedStudent(supabase, nisn);
    if (loaded.error) return loaded.error;
    const { student, basicStudentData } = loaded;

    // 3. Semua ujian yang sedang aktif
    const { data: activeExams, error: examError } = await supabase
      .from('exams')
      .select('id, name, created_at, exam_settings(card_title)')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (examError || !activeExams || activeExams.length === 0) {
      return { success: false, error: 'server_error', message: 'Belum ada ujian aktif.', student: basicStudentData };
    }

    const examIds = activeExams.map((ex) => ex.id);

    // 4. Kartu ACTIVE milik siswa untuk ujian-ujian aktif
    const { data: cards, error: cardError } = await supabase
      .from('exam_cards')
      .select('exam_id, card_number')
      .eq('student_id', student.id)
      .eq('status', 'ACTIVE')
      .in('exam_id', examIds);

    if (cardError || !cards || cards.length === 0) {
      return { success: false, error: 'server_error', message: 'Kartu ujian belum diterbitkan untuk periode aktif ini.', student: basicStudentData };
    }

    // 5. Jadwal aktif untuk kelas siswa di ujian-ujian aktif
    const { data: schedules } = await supabase
      .from('schedules')
      .select('exam_id')
      .eq('class_id', student.class_id)
      .eq('is_active', true)
      .in('exam_id', examIds);

    const cardByExam = new Map<number, string>();
    cards.forEach((c) => {
      if (!cardByExam.has(c.exam_id)) cardByExam.set(c.exam_id, c.card_number);
    });
    const examsWithSchedule = new Set((schedules || []).map((s) => s.exam_id));

    const exams: StudentExamOption[] = activeExams
      .filter((ex) => cardByExam.has(ex.id) && examsWithSchedule.has(ex.id))
      .map((ex) => {
        const settings = Array.isArray(ex.exam_settings) ? ex.exam_settings[0] : ex.exam_settings;
        return {
          examId: ex.id,
          cardTitle: settings?.card_title || 'KARTU PESERTA UJIAN',
          examName: ex.name,
          cardNumber: cardByExam.get(ex.id) || '-',
        };
      });

    if (exams.length === 0) {
      return { success: false, error: 'server_error', message: `Jadwal ujian untuk kelas ${student.classes?.class_name || 'ini'} belum tersedia.` };
    }

    const uniqueNumbers = Array.from(new Set(exams.map((ex) => ex.cardNumber)));
    basicStudentData.examNumber = uniqueNumbers.join(', ');

    return { success: true, student: basicStudentData, exams };

  } catch (error: unknown) {
    console.error("Server Action Error:", error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem yang tidak terduga.';
    return { success: false, error: 'server_error', message };
  }
}

/** Data kartu lengkap untuk satu ujian yang dipilih siswa. */
export async function fetchStudentCardDataByExam(nisn: string, examId: number): Promise<CardActionResponse> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: 'server_error', message: MISSING_KEY_MESSAGE };
    }

    const supabase = createAdminClient();

    // 1 & 2. Data siswa + cek approval
    const loaded = await loadApprovedStudent(supabase, nisn);
    if (loaded.error) return loaded.error;
    const { student, basicStudentData } = loaded;

    // 3. Pastikan ujian yang dipilih masih aktif
    const { data: activeExam, error: examError } = await supabase
      .from('exams')
      .select('id')
      .eq('id', examId)
      .eq('is_active', true)
      .maybeSingle();

    if (examError || !activeExam) {
      return { success: false, error: 'server_error', message: 'Ujian yang dipilih sedang tidak aktif.', student: basicStudentData };
    }

    // 4. Cek exam_cards untuk ujian tersebut
    const { data: examCard, error: cardError } = await supabase
      .from('exam_cards')
      .select('*')
      .eq('student_id', student.id)
      .eq('exam_id', activeExam.id)
      .eq('status', 'ACTIVE')
      .limit(1)
      .maybeSingle();

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
        place_of_birth: student.place_of_birth,
        date_of_birth: student.date_of_birth,
        exam_room: student.exam_room,
        exam_password: student.exam_password,
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
        show_password: settingsRes.data?.show_password ?? true,
        allow_download: settingsRes.data?.allow_download ?? true,
        allow_print: settingsRes.data?.allow_print ?? true,
        chairperson_name: settingsRes.data?.chairperson_name || 'Panitia Ujian',
        signature_url: settingsRes.data?.signature_url || null,
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

  } catch (error: unknown) {
    console.error("Server Action Error:", error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem yang tidak terduga.';
    return { success: false, error: 'server_error', message };
  }
}
