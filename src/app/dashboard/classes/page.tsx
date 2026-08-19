import { getClassesWithCount } from './actions';
import ClassTable from '@/components/dashboard/classes/ClassTable';
import { AlertCircle } from 'lucide-react';

export default async function ClassesPage() {
  const classesRes = await getClassesWithCount();

  if (!classesRes.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-red-800">
          <h3 className="font-bold">Gagal memuat data kelas</h3>
          <p className="text-sm mt-1">{classesRes.error}</p>
        </div>
      </div>
    );
  }

  return (
    <ClassTable 
      classes={classesRes.data || []} 
    />
  );
}
