'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import ClassFormModal from './ClassFormModal';
import { deleteClass } from '@/app/dashboard/classes/actions';

interface ClassTableProps {
  classes: any[];
}

export default function ClassTable({ classes: initialClasses }: ClassTableProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  
  // Filter Logic
  const filteredClasses = initialClasses.filter(c => {
    const term = search.toLowerCase();
    return c.class_name.toLowerCase().includes(term) || 
           c.major.toLowerCase().includes(term) ||
           c.grade.toLowerCase().includes(term) ||
           c.academic_year.toLowerCase().includes(term);
  });

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data kelas ini? Pastikan tidak ada siswa yang terhubung.')) {
      const res = await deleteClass(id);
      if (res.error) {
        alert(res.error);
      }
    }
  };

  const openEdit = (classData: any) => {
    setEditingClass(classData);
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar kelas dan jurusan SMK Ekonomika.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Kelas
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari nama kelas, jurusan, tingkat..." 
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
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Nama Kelas</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Tingkat</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Jurusan</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Tahun Ajaran</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-center">Jml. Siswa</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((c) => {
                  // count di-parse karena kembalian Supabase aggregate query kadang array [{count: X}]
                  const studentCount = Array.isArray(c.students) ? c.students[0]?.count || 0 : c.students?.count || 0;
                  
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{c.class_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{c.grade}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{c.major}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{c.academic_year}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <Users className="w-3.5 h-3.5" />
                            {studentCount} Siswa
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
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
                    Tidak ada data kelas yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClassFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        classData={editingClass} 
      />
      
    </div>
  );
}
