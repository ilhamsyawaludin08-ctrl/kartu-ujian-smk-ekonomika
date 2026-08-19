import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all data
  const [
    { count: studentsCount, error: studentsError },
    { count: approvedCount, error: approvedError },
    { count: pendingCount, error: pendingError },
    { count: classesCount, error: classesError },
    { data: classesData, error: classesDataError },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('approval_status', 'Approved'),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('approval_status', 'Pending'),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('major'),
  ]);

  const hasError = studentsError || approvedError || pendingError || classesError || classesDataError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data Dashboard</h2>
        <p className="text-gray-500">Terjadi kesalahan saat mengambil data dari sistem. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const majors = new Set(classesData?.map((c) => c.major).filter(Boolean));
  const majorsCount = majors.size;
  
  const total = studentsCount || 0;
  const approved = approvedCount || 0;
  const pending = pendingCount || 0;
  
  const approvedPercent = total === 0 ? 0 : Math.round((approved / total) * 100);
  const pendingPercent = total === 0 ? 0 : Math.round((pending / total) * 100);

  return (
    <div className="space-y-6 md:space-y-8 max-w-[100vw] overflow-hidden px-1 sm:px-0">
      
      {/* Header Section */}
      <div className="mb-4 pt-2">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 font-medium">Ringkasan sistem kartu ujian SMK Ekonomika.</p>
      </div>
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Siswa */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-3">Total Siswa</p>
          <h3 className="text-4xl font-extrabold text-gray-900 mb-3">{total}</h3>
          <p className="text-gray-400 text-sm">Seluruh siswa terdaftar</p>
        </div>

        {/* Kartu Siap */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-3">Kartu Siap</p>
          <h3 className="text-4xl font-extrabold text-[#16a34a] mb-3">{approved}</h3>
          <p className="text-gray-400 text-sm">Siswa yang dapat mencetak kartu</p>
        </div>

        {/* Belum Siap */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-3">Belum Siap</p>
          <h3 className="text-4xl font-extrabold text-[#dc2626] mb-3">{pending}</h3>
          <p className="text-gray-400 text-sm">Siswa yang perlu ditindaklanjuti</p>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-3">Total Kelas</p>
          <h3 className="text-4xl font-extrabold text-gray-900 mb-3">{classesCount || 0}</h3>
          <p className="text-gray-400 text-sm">Kelas yang tersedia</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-3">Total Jurusan</p>
          <h3 className="text-4xl font-extrabold text-gray-900 mb-3">{majorsCount}</h3>
          <p className="text-gray-400 text-sm">Program keahlian</p>
        </div>
      </div>

      {/* Progress Kartu Ujian */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900">Progress Kartu Ujian</h2>
        <p className="text-sm text-gray-500 mb-8 mt-1">Persentase kesiapan kartu seluruh siswa.</p>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">Kartu Siap</span>
              <span className="text-gray-900 font-bold">{approvedPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-[#16a34a] h-3 rounded-full" style={{ width: `${approvedPercent}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">Belum Siap</span>
              <span className="text-gray-900 font-bold">{pendingPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-[#dc2626] h-3 rounded-full" style={{ width: `${pendingPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Cepat */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Menu Cepat</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/students" className="p-6 rounded-xl border border-gray-200 hover:border-[#5c2b90] hover:shadow-md transition-all group">
            <h3 className="font-bold text-gray-900 group-hover:text-[#5c2b90] transition-colors mb-2">Data Siswa</h3>
            <p className="text-sm text-gray-500">Kelola data peserta ujian.</p>
          </Link>
          
          <Link href="/dashboard/schedules" className="p-6 rounded-xl border border-gray-200 hover:border-[#5c2b90] hover:shadow-md transition-all group">
            <h3 className="font-bold text-gray-900 group-hover:text-[#5c2b90] transition-colors mb-2">Jadwal Ujian</h3>
            <p className="text-sm text-gray-500">Kelola jadwal berdasarkan kelas.</p>
          </Link>
          
          <Link href="/dashboard/exam-cards" className="p-6 rounded-xl border border-gray-200 hover:border-[#5c2b90] hover:shadow-md transition-all group">
            <h3 className="font-bold text-gray-900 group-hover:text-[#5c2b90] transition-colors mb-2">Kartu Ujian</h3>
            <p className="text-sm text-gray-500">Cari dan cetak kartu peserta.</p>
          </Link>
        </div>
      </div>

    </div>
  );
}
