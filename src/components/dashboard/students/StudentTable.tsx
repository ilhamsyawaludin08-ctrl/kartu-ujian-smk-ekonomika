'use client';

import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, CheckCircle, FileSpreadsheet, XCircle } from 'lucide-react';
import StudentFormModal from './StudentFormModal';
import ExcelImportModal from './ExcelImportModal';
import { deleteStudent, approveStudent, setPendingStudent } from '@/app/dashboard/students/actions';

interface StudentTableProps {
  students: any[];
  classes: any[];
}

export default function StudentTable({ students: initialStudents, classes }: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // Filter Logic
  const filteredStudents = initialStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.nisn.includes(search) ||
                        (s.classes?.class_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.approval_status === statusFilter;
    const matchClass = classFilter === 'All' || s.class_id?.toString() === classFilter;
    return matchSearch && matchStatus && matchClass;
  });

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini? Semua kartu ujian yang terkait mungkin ikut terhapus.')) {
      await deleteStudent(id);
    }
  };

  const handleApprove = async (id: number) => {
    if (confirm('Approve siswa ini? Kartu ujian akan otomatis dibuatkan jika ada ujian aktif.')) {
      const res = await approveStudent(id);
      if (res.error) alert(res.error);
      if (res.warning) alert(res.warning);
    }
  };

  const handleSetPending = async (id: number) => {
    if (confirm('Kembalikan status siswa menjadi Pending? Kartu ujiannya akan dinonaktifkan.')) {
      const res = await setPendingStudent(id);
      if (res.error) alert(res.error);
    }
  };

  const openEdit = (student: any) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data siswa dan persetujuan ujian.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsExcelOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors font-semibold text-sm border border-green-200 w-full sm:w-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Import Excel
          </button>
          <button 
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari NISN, nama, atau kelas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 focus-within:ring-2 focus-within:ring-primary transition-all flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 bg-transparent border-none outline-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer w-full sm:w-auto truncate"
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 focus-within:ring-2 focus-within:ring-primary transition-all flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="py-2.5 bg-transparent border-none outline-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer w-full sm:w-auto sm:max-w-[200px] truncate"
            >
              <option value="All">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.class_name} {c.major}</option>
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
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">NISN</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Nama Siswa</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Kelas / Jurusan</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{student.nisn}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.classes ? `${student.classes.class_name} - ${student.classes.major}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {student.approval_status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-green-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-yellow-800 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.approval_status === 'Pending' ? (
                          <button 
                            onClick={() => handleApprove(student.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve & Buat Kartu"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSetPending(student.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Set Pending & Nonaktifkan Kartu"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => openEdit(student)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data siswa yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        classes={classes} 
        student={editingStudent} 
      />
      
      <ExcelImportModal 
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
      />

    </div>
  );
}
