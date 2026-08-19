'use client';

import { useState } from 'react';
import { updateStudent, createStudent } from '@/app/dashboard/students/actions';
import { Loader2, X } from 'lucide-react';

interface ClassItem {
  id: number;
  class_name: string;
  major: string;
}

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  student?: any; // Jika null/undefined berarti mode Tambah
}

export default function StudentFormModal({ isOpen, onClose, classes, student }: StudentFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let res;

    if (student) {
      res = await updateStudent(student.id, formData);
    } else {
      res = await createStudent(formData);
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
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {student ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <div className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Data Pribadi Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Data Pribadi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                  <input 
                    name="nisn" 
                    type="text" 
                    required 
                    defaultValue={student?.nisn || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    defaultValue={student?.name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Jurusan</label>
                <select 
                  name="class_id" 
                  required 
                  defaultValue={student?.class_id || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="" disabled>Pilih Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class_name} - {c.major}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input 
                    name="place_of_birth" 
                    type="text" 
                    defaultValue={student?.place_of_birth || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input 
                    name="date_of_birth" 
                    type="date" 
                    defaultValue={student?.date_of_birth || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Siswa</label>
                <input 
                  name="photo" 
                  type="file" 
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {student?.photo_url && (
                  <p className="text-xs text-green-600 mt-1">Siswa ini sudah memiliki foto. Upload baru untuk mengganti.</p>
                )}
              </div>
            </div>

            {/* Data Ujian Section */}
            <div className="space-y-4 pt-2">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-gray-900">Data Ujian</h3>
                <p className="text-xs text-gray-500">Informasi yang digunakan untuk kartu ujian.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Ujian</label>
                  <input 
                    name="exam_number" 
                    type="text" 
                    defaultValue={student?.exam_number || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ruang Ujian</label>
                  <input 
                    name="exam_room" 
                    type="text" 
                    defaultValue={student?.exam_room || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Ujian</label>
                <input 
                  name="exam_password" 
                  type="text" 
                  defaultValue={student?.exam_password || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Password ini dapat digunakan pada kartu atau akses ujian siswa.</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3 bg-gray-50">
            <button 
              type="button" 
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors font-medium text-center"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto justify-center px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {student ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
