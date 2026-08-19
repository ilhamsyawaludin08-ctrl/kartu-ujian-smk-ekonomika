import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Building, Calendar, Activity, Clock, AlertCircle } from 'lucide-react';
import React from 'react';

// Pastikan dashboard selalu mengambil data terbaru (opt-out dari static rendering)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all data in parallel for optimal performance
  const [
    { count: studentsCount, error: studentsError },
    { count: classesCount, error: classesError },
    { count: schedulesCount, error: schedulesError },
    { count: activeExamsCount, error: activeExamsError },
    { data: activeExams, error: activeExamsDataError },
    { data: recentSchedules, error: recentSchedulesError }
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('schedules').select('*', { count: 'exact', head: true }),
    supabase.from('exams').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('exams').select('id, name, academic_year, semester').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('schedules').select('*, classes(class_name), exams(name)').order('created_at', { ascending: false }).limit(5)
  ]);

  // Handle generic error state if any critical query fails
  const hasError = studentsError || classesError || schedulesError || activeExamsError || activeExamsDataError || recentSchedulesError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data Dashboard</h2>
        <p className="text-gray-500">Terjadi kesalahan saat mengambil data dari sistem. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const stats = [
    { name: 'Total Siswa', value: studentsCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Total Kelas', value: classesCount || 0, icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { name: 'Jadwal Ujian', value: schedulesCount || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { name: 'Ujian Aktif', value: activeExamsCount || 0, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-[100vw] overflow-hidden px-1 sm:px-0">
      
      {/* Header Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 truncate">Selamat Datang di Dashboard TU</h1>
        <p className="text-sm md:text-base text-gray-500">
          Ringkasan data sistem Kartu Ujian SMK Ekonomika saat ini.
        </p>
      </div>
      
      {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} flex items-center justify-between hover:shadow-md transition-shadow`}>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} p-4 rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Recent Schedules */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Jadwal Ujian Terbaru
              </h2>
            </div>
            
            {recentSchedules && recentSchedules.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelas</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ujian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {recentSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{schedule.subject}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {/* @ts-ignore */}
                            {schedule.classes?.class_name || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {new Date(schedule.exam_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {schedule.start_time.slice(0,5)} - {schedule.end_time.slice(0,5)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 truncate max-w-[150px]">
                            {/* @ts-ignore */}
                            {schedule.exams?.name || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                <p>Belum ada jadwal ujian yang ditambahkan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Exams */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-emerald-500" />
              Ujian Aktif Saat Ini
            </h2>
            
            <div className="space-y-4 flex-1">
              {activeExams && activeExams.length > 0 ? (
                activeExams.map((exam) => (
                  <div key={exam.id} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col gap-1 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-sm">{exam.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      {exam.academic_year} — {exam.semester}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px]">
                  <p className="text-sm text-gray-500 font-medium">Belum ada ujian aktif.</p>
                  <p className="text-xs text-gray-400 mt-1">Aktifkan ujian di menu Pengaturan Ujian.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
