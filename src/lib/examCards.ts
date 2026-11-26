// Helper bersama untuk membuat / mengaktifkan kartu ujian siswa.
// Dipakai oleh server action approve siswa dan aktivasi ujian.

import { SupabaseClient } from '@supabase/supabase-js';

type ExamForCard = { id: number; name: string; academic_year: string };
type StudentForCard = { id: number; exam_number: string | null };

const CHUNK_SIZE = 500;

// Format: EKM-[KODE_UJIAN]-[TAHUN]-[NOMOR_URUT]
export function buildGeneratedCardNumber(exam: ExamForCard, sequence: number) {
  const examCode = exam.name.split(' ')[0].toUpperCase();
  const tahun = exam.academic_year.substring(0, 4);
  const urutStr = sequence.toString().padStart(5, '0');
  return `EKM-${examCode}-${tahun}-${urutStr}`;
}

/**
 * Pastikan setiap siswa punya kartu ACTIVE untuk ujian tertentu.
 * - Kartu yang sudah ada diaktifkan kembali (tidak dibuat dobel).
 * - Kartu baru memakai students.exam_number; jika kosong, nomor digenerate otomatis.
 */
export async function ensureActiveCards(
  supabase: SupabaseClient,
  exam: ExamForCard,
  students: StudentForCard[]
): Promise<{ error?: string }> {
  if (students.length === 0) return {};

  // 1. Ambil kartu yang sudah ada untuk siswa-siswa ini di ujian ini
  const existing = new Map<number, { id: number; status: string }>();
  for (let i = 0; i < students.length; i += CHUNK_SIZE) {
    const ids = students.slice(i, i + CHUNK_SIZE).map((s) => s.id);
    const { data, error } = await supabase
      .from('exam_cards')
      .select('id, student_id, status')
      .eq('exam_id', exam.id)
      .in('student_id', ids);
    if (error) return { error: error.message };
    (data || []).forEach((c: { id: number; student_id: number; status: string }) => {
      if (!existing.has(c.student_id)) existing.set(c.student_id, { id: c.id, status: c.status });
    });
  }

  // 2. Aktifkan kembali kartu yang sudah ada tapi belum ACTIVE
  const toActivate = Array.from(existing.values())
    .filter((c) => c.status !== 'ACTIVE')
    .map((c) => c.id);
  for (let i = 0; i < toActivate.length; i += CHUNK_SIZE) {
    const { error } = await supabase
      .from('exam_cards')
      .update({ status: 'ACTIVE' })
      .in('id', toActivate.slice(i, i + CHUNK_SIZE));
    if (error) return { error: error.message };
  }

  // 3. Buat kartu baru untuk siswa yang belum punya
  const missing = students.filter((s) => !existing.has(s.id));
  if (missing.length === 0) return {};

  let sequence = 0;
  if (missing.some((s) => !s.exam_number)) {
    const { count, error } = await supabase
      .from('exam_cards')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', exam.id);
    if (error) return { error: error.message };
    sequence = count || 0;
  }

  const rows = missing.map((s) => ({
    student_id: s.id,
    exam_id: exam.id,
    card_number: s.exam_number || buildGeneratedCardNumber(exam, ++sequence),
    status: 'ACTIVE',
  }));

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const { error } = await supabase.from('exam_cards').insert(rows.slice(i, i + CHUNK_SIZE));
    if (error) return { error: error.message };
  }

  return {};
}
