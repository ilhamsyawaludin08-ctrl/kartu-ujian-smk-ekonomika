'use client';

import { useState } from 'react';
import { updateExam, createExam } from '@/app/dashboard/exams/actions';
import { Loader2, X } from 'lucide-react';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  examData?: any; // null for add mode
}

export default function ExamFormModal({ isOpen, onClose, examData }: ExamFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const settings = examData?.exam_settings?.[0] || {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Checkboxes convert
    const checkboxes = ['is_active', 'show_photo', 'show_room', 'show_schedule', 'allow_print', 'allow_download'];
    checkboxes.forEach(key => {
      formData.set(key, formData.get(key) === 'on' ? 'true' : 'false');
    });

    let res;
    if (examData) {
      res = await updateExam(examData.id, formData);
    } else {
      res = await createExam(formData);
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
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {examData ? 'Edit Pengaturan Ujian' : 'Buat Ujian Baru'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Konfigurasi data periode ujian dan tampilan kartu ujian peserta.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="exam-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-medium mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* KOLOM KIRI: Data Ujian */}
            <div className="space-y-4">
              <h3 className="font-bold text-primary border-b border-primary/20 pb-2 mb-4">Informasi Periode Ujian</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Ujian</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Contoh: Penilaian Sumatif Akhir Tahun"
                  defaultValue={examData?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Ajaran</label>
                  <input 
                    name="academic_year" 
                    type="text" 
                    required 
                    placeholder="Contoh: 2025/2026"
                    defaultValue={examData?.academic_year || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
                  <select 
                    name="semester" 
                    required 
                    defaultValue={examData?.semester || 'Ganjil'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-sm"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Sekolah (Untuk Ujian Ini)</label>
                <input 
                  name="school_name" 
                  type="text" 
                  required 
                  defaultValue={examData?.school_name || 'SMK Ekonomika'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Mulai</label>
                  <input 
                    name="start_date" 
                    type="date" 
                    required 
                    defaultValue={examData?.start_date || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Selesai</label>
                  <input 
                    name="end_date" 
                    type="date" 
                    required 
                    defaultValue={examData?.end_date || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link Server CBT (Opsional)</label>
                <input 
                  name="server_url" 
                  type="url" 
                  placeholder="https://cbt.smkekonomika.sch.id"
                  defaultValue={examData?.server_url || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      defaultChecked={examData ? examData.is_active : false}
                      className="peer sr-only"
                    />
                    <div className="block bg-gray-300 w-10 h-6 rounded-full peer-checked:bg-primary transition-colors"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform peer-checked:translate-x-4"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800 block">Jadikan Ujian Aktif</span>
                    <span className="text-xs text-gray-500 block">Hanya 1 ujian yang bisa aktif bersamaan. Ujian aktif lain akan dinonaktifkan.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* KOLOM KANAN: Konfigurasi Kartu */}
            <div className="space-y-4">
              <h3 className="font-bold text-primary border-b border-primary/20 pb-2 mb-4">Pengaturan Kartu Ujian</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Kartu</label>
                <input 
                  name="card_title" 
                  type="text" 
                  required 
                  placeholder="Contoh: KARTU PESERTA UJIAN"
                  defaultValue={settings.card_title || 'KARTU PESERTA UJIAN'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Ketua Pelaksana (TTD)</label>
                <input 
                  name="chairperson_name" 
                  type="text" 
                  placeholder="Masukkan nama ketua beserta gelar"
                  defaultValue={settings.chairperson_name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanda Tangan Ketua Pelaksana</label>
                <input 
                  name="signature" 
                  type="file" 
                  accept="image/png, image/jpeg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 text-sm"
                />
                {settings.signature_url && (
                  <p className="text-xs text-green-600 mt-1">Ujian ini sudah memiliki foto tanda tangan. Upload baru untuk mengganti.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan/Peraturan Ujian</label>
                <textarea 
                  name="exam_notes" 
                  rows={3}
                  placeholder="1. Peserta wajib hadir 15 menit sebelum ujian dimulai..."
                  defaultValue={settings.exam_notes || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" name="show_photo" defaultChecked={settings.show_photo ?? true} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  Tampilkan Pas Foto
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" name="show_room" defaultChecked={settings.show_room ?? true} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  Tampilkan Kolom Ruang
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" name="show_schedule" defaultChecked={settings.show_schedule ?? true} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  Tampilkan Tabel Jadwal
                </label>
              </div>

              <h4 className="font-bold text-gray-800 text-sm mt-6 mb-3">Hak Akses Portal Siswa</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" name="allow_print" defaultChecked={settings.allow_print ?? true} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  Izinkan Cetak (Print)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" name="allow_download" defaultChecked={settings.allow_download ?? true} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  Izinkan Unduh PDF
                </label>
              </div>

            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3 bg-gray-50/50 rounded-b-2xl shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors font-medium text-sm text-center"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="exam-form"
            disabled={isLoading}
            className="w-full sm:w-auto justify-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {examData ? 'Simpan Perubahan' : 'Buat Ujian'}
          </button>
        </div>
      </div>
    </div>
  );
}
