import ExamCardSearch from '@/components/dashboard/exam-cards/ExamCardSearch';

export default function ExamCardsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 print:space-y-0 print:block">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Kartu Ujian (TU)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cari siswa dan pratinjau kartu ujian berdasarkan ujian yang sedang aktif saat ini.
        </p>
      </div>

      <ExamCardSearch />
    </div>
  );
}
