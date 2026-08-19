import { getStudents, getClasses } from './actions';
import StudentTable from '@/components/dashboard/students/StudentTable';
import { AlertCircle } from 'lucide-react';

export default async function StudentsPage() {
  const [studentsRes, classesRes] = await Promise.all([
    getStudents(),
    getClasses()
  ]);

  if (!studentsRes.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-red-800">
          <h3 className="font-bold">Gagal memuat data siswa</h3>
          <p className="text-sm mt-1">{studentsRes.error}</p>
        </div>
      </div>
    );
  }

  return (
    <StudentTable 
      students={studentsRes.data || []} 
      classes={classesRes.data || []} 
    />
  );
}
