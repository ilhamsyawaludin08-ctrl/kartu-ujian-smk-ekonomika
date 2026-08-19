'use client';

import { useState } from 'react';
import { updateClass, createClass } from '@/app/dashboard/classes/actions';
import { Loader2, X } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: any; // null for add mode
}

export default function ClassFormModal({ isOpen, onClose, classData }: ClassFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let res;

    if (classData) {
      res = await updateClass(classData.id, formData);
    } else {
      res = await createClass(formData);
    }

    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {classData ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat (Grade)</label>
            <select 
              name="grade" 
              required 
              defaultValue={classData?.grade || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            >
              <option value="" disabled>Pilih Tingkat</option>
              <option value="X">X (Sepuluh)</option>
              <option value="XI">XI (Sebelas)</option>
              <option value="XII">XII (Dua Belas)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan (Major)</label>
            <input 
              name="major" 
              type="text" 
              required 
              placeholder="Contoh: AKL, TKJ, dll."
              defaultValue={classData?.major || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas (Lengkap)</label>
            <input 
              name="class_name" 
              type="text" 
              required 
              placeholder="Contoh: X AKL 1"
              defaultValue={classData?.class_name || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <input 
              name="academic_year" 
              type="text" 
              required 
              placeholder="Contoh: 2025/2026"
              defaultValue={classData?.academic_year || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium text-center"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto justify-center px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {classData ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
