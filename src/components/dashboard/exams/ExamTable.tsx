'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CalendarDays, CheckCircle, XCircle, Power } from 'lucide-react';
import ExamFormModal from './ExamFormModal';
import { deleteExam, toggleExamStatus } from '@/app/dashboard/exams/actions';

interface ExamTableProps {
  exams: any[];
}

export default function ExamTable({ exams: initialExams }: ExamTableProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  
  // Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }).format(new Date(dateString));
  };

  const filteredExams = initialExams.filter(ex => {
    return ex.name.toLowerCase().includes(search.toLowerCase()) || 
           ex.academic_year.includes(search) ||
           ex.semester.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus ujian ini? Ini hanya bisa dilakukan jika ujian belum memiliki jadwal atau peserta.')) {
      const res = await deleteExam(id);
      if (res.error) {
        alert(res.error);
      }
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!currentStatus) {
      if (!confirm('Mengaktifkan ujian ini akan otomatis menonaktifkan ujian lainnya. Lanjutkan?')) return;
    }
    const res = await toggleExamStatus(id, currentStatus);
    if (res.error) alert(res.error);
  };

  const openEdit = (examData: any) => {
    setEditingExam(examData);
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingExam(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Ujian</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data ujian, status aktif, dan pengaturan kartu ujian.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <button 
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Buat Ujian Baru
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari nama ujian, tahun ajaran..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Nama Ujian</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Pelaksanaan</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Tahun/Semester</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExams.length > 0 ? (
                filteredExams.map((ex) => {
                  return (
                    <tr key={ex.id} className={`hover:bg-gray-50/80 transition-colors ${ex.is_active ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{ex.name}</p>
                        {ex.exam_settings?.[0]?.chairperson_name && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                            Ketua: {ex.exam_settings[0].chairperson_name}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5 font-medium text-gray-700">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          {formatDate(ex.start_date)} - {formatDate(ex.end_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{ex.academic_year}</span>
                          <span className="text-xs font-semibold text-gray-500">{ex.semester}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {ex.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-green-800 shadow-sm">
                              <CheckCircle className="w-4 h-4" />
                              Sedang Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                              <XCircle className="w-4 h-4" />
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleToggleActive(ex.id, ex.is_active)}
                            className={`p-1.5 rounded-lg transition-colors ${ex.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-800'}`}
                            title={ex.is_active ? 'Nonaktifkan' : 'Jadikan Aktif'}
                          >
                            <Power className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => openEdit(ex)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit & Pengaturan Kartu"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ex.id)}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data ujian yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExamFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        examData={editingExam} 
      />
      
    </div>
  );
}
