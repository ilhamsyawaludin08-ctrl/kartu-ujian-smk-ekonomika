'use client';

import { useState } from 'react';
import { Plus, Search, FileSpreadsheet } from 'lucide-react';
import SubjectFormModal from './SubjectFormModal';
import ImportSubjectModal from './ImportSubjectModal';
import SubjectTableRow from './SubjectTableRow';

export default function SubjectTable({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredData = initialData.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.teacher_name && d.teacher_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari mata pelajaran atau nama guru..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors font-medium text-sm border border-emerald-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span> Excel
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah <span className="hidden sm:inline">Mapel</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 text-center">No</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guru Pengajar</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((subject, idx) => (
                <SubjectTableRow key={subject.id} subject={subject} index={idx} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Mata pelajaran tidak ditemukan</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {search ? 'Coba gunakan kata kunci pencarian yang lain.' : 'Belum ada data mata pelajaran. Silakan tambahkan data baru.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SubjectFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
      
      <ImportSubjectModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />
    </div>
  );
}
