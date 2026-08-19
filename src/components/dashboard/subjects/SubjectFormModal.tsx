'use client';

import { useState } from 'react';
import { updateSubject, createSubject } from '@/app/dashboard/subjects/actions';
import { Loader2, X } from 'lucide-react';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: any; // Jika null/undefined berarti mode Tambah
}

export default function SubjectFormModal({ isOpen, onClose, subject }: SubjectFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let res;

    if (subject) {
      res = await updateSubject(subject.id, formData);
    } else {
      res = await createSubject(formData);
    }

    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {subject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Pelajaran</label>
            <input 
              name="name" 
              type="text" 
              required 
              defaultValue={subject?.name || ''}
              placeholder="Contoh: Matematika"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Guru Pengajar (Opsional)</label>
            <input 
              name="teacher_name" 
              type="text" 
              defaultValue={subject?.teacher_name || ''}
              placeholder="Contoh: Budi Santoso, S.Pd"
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
              {subject ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
