import { getSubjects } from './actions';
import SubjectTable from '@/components/dashboard/subjects/SubjectTable';
import { AlertCircle } from 'lucide-react';

export default async function SubjectsPage() {
  const { data, success, error } = await getSubjects();

  if (!success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900">Gagal memuat data mata pelajaran</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Mata Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola daftar mata pelajaran dan guru pengajar untuk keperluan jadwal ujian.
        </p>
      </div>
      <SubjectTable initialData={data || []} />
    </div>
  );
}
