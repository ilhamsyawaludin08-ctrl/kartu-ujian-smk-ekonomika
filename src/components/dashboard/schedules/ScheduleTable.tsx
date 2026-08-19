'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Clock, MapPin, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import ScheduleFormModal from './ScheduleFormModal';
import { deleteSchedule } from '@/app/dashboard/schedules/actions';

interface ScheduleTableProps {
  schedules: any[];
  exams: any[];
  classes: any[];
}

export default function ScheduleTable({ schedules: initialSchedules, exams, classes }: ScheduleTableProps) {
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  
  // Format Tanggal helper
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  // Format Waktu helper (menghapus detik)
  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    // Biasanya formatnya "HH:MM:SS", kita ambil HH:MM
    return timeString.substring(0, 5);
  };

  // Filter Logic
  const filteredSchedules = initialSchedules.filter(s => {
    const term = search.toLowerCase();
    const matchSearch = s.subject.toLowerCase().includes(term) || 
                        (s.room || '').toLowerCase().includes(term);
    
    const matchExam = examFilter === 'All' || s.exam_id?.toString() === examFilter;
    const matchClass = classFilter === 'All' || s.class_id?.toString() === classFilter;
    
    return matchSearch && matchExam && matchClass;
  });

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini? Jadwal akan terhapus dari kartu siswa terkait.')) {
      const res = await deleteSchedule(id);
      if (res.error) {
        alert(res.error);
      }
    }
  };

  const openEdit = (scheduleData: any) => {
    setEditingSchedule(scheduleData);
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Jadwal Ujian</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola jadwal berdasarkan periode ujian dan kelas secara presisi.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <button 
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari mata pelajaran atau ruang..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        
        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Exam Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 focus-within:ring-2 focus-within:ring-primary transition-all flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            <select 
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="py-2.5 bg-transparent border-none outline-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer w-full sm:w-auto sm:max-w-[250px] truncate"
            >
              <option value="All">Semua Ujian</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id.toString()}>{ex.name} ({ex.academic_year} - {ex.semester})</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 focus-within:ring-2 focus-within:ring-primary transition-all flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="py-2.5 bg-transparent border-none outline-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer w-full sm:w-auto sm:max-w-[150px] truncate"
            >
              <option value="All">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.class_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Mata Pelajaran</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Kelas Target</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Waktu Pelaksanaan</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Ruang</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((s) => {
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{s.subject}</p>
                        <p className="text-xs text-primary font-medium mt-0.5">{s.exams?.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {s.classes?.class_name || 'Tidak diketahui'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(s.exam_date)}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatTime(s.start_time)} - {formatTime(s.end_time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {s.room ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {s.room}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {s.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-green-800">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                              <XCircle className="w-3.5 h-3.5" />
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada jadwal ujian yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScheduleFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        scheduleData={editingSchedule} 
        exams={exams}
        classes={classes}
      />
      
    </div>
  );
}
