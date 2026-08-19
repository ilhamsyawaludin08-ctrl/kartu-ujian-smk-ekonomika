import { getSchedules, getExams, getClasses, getSubjects } from './actions';
import ScheduleTable from '@/components/dashboard/schedules/ScheduleTable';
import { AlertCircle } from 'lucide-react';

export default async function SchedulesPage() {
  const [schedulesRes, subjectsRes, examsRes, classesRes] = await Promise.all([
    getSchedules(), getSubjects(),
    getExams(),
    getClasses()
  ]);

  if (!schedulesRes.success || !examsRes.success || !classesRes.success) {
    const errorMsg = schedulesRes.error || examsRes.error || classesRes.error;
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-red-800">
          <h3 className="font-bold">Gagal memuat data jadwal</h3>
          <p className="text-sm mt-1">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <ScheduleTable 
      schedules={schedulesRes.data || []}
      subjects={subjectsRes.data || []} 
      exams={examsRes.data || []}
      classes={classesRes.data || []}
    />
  );
}
