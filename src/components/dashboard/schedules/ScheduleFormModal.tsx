'use client';

import { useState, useEffect } from 'react';
import { updateSchedule, createBulkSchedules } from '@/app/dashboard/schedules/actions';
import { Loader2, X, Plus, Trash2 } from 'lucide-react';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleData?: any; // null for add mode
  exams: any[];
  classes: any[];
}

export default function ScheduleFormModal({ isOpen, onClose, scheduleData, exams, classes }: ScheduleFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global settings for the bulk
  const [examId, setExamId] = useState('');
  const [classId, setClassId] = useState('');

  // Rows state
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (scheduleData) {
        setExamId(scheduleData.exam_id?.toString() || '');
        setClassId(scheduleData.class_id?.toString() || '');
        setRows([{ ...scheduleData }]);
      } else {
        setExamId('');
        setClassId('');
        setRows([{ id: Date.now(), subject: '', exam_date: '', start_time: '', end_time: '', room: '', is_active: true }]);
      }
      setError(null);
    }
  }, [isOpen, scheduleData]);

  if (!isOpen) return null;

  const addRow = () => {
    setRows([...rows, { id: Date.now(), subject: '', exam_date: '', start_time: '', end_time: '', room: '', is_active: true }]);
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) return; // minimal 1 row
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: string, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!examId || !classId) {
      setError('Silakan pilih Periode Ujian dan Kelas Target terlebih dahulu.');
      return;
    }

    // Validasi rows
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.subject || !r.exam_date || !r.start_time || !r.end_time) {
        setError(`Baris ke-${i + 1} memiliki data yang belum lengkap (Mata Pelajaran, Tanggal, atau Jam).`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    let res;
    if (scheduleData) {
      // Edit mode -> update 1 row
      const formData = new FormData();
      formData.append('exam_id', examId);
      formData.append('class_id', classId);
      formData.append('subject', rows[0].subject);
      formData.append('exam_date', rows[0].exam_date);
      formData.append('start_time', rows[0].start_time);
      formData.append('end_time', rows[0].end_time);
      formData.append('room', rows[0].room || '');
      formData.append('is_active', rows[0].is_active ? 'true' : 'false');
      
      res = await updateSchedule(scheduleData.id, formData);
    } else {
      // Add mode -> bulk create
      res = await createBulkSchedules(parseInt(examId), parseInt(classId), rows);
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
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {scheduleData ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {scheduleData ? 'Ubah informasi jadwal ini.' : 'Tambahkan banyak jadwal sekaligus untuk satu kelas.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="schedule-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* Pengikatan Ujian & Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Periode Ujian (Global)</label>
              <select 
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white font-medium"
              >
                <option value="" disabled>-- Pilih Ujian --</option>
                {(scheduleData ? exams : exams.filter(ex => ex.is_active)).map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kelas Target (Global)</label>
              <select 
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white font-medium"
              >
                <option value="" disabled>-- Pilih Kelas --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Daftar Mata Pelajaran</h3>
              {!scheduleData && (
                <button 
                  type="button" 
                  onClick={addRow}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Baris
                </button>
              )}
            </div>

            {/* Render Rows */}
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white border border-gray-200 p-4 rounded-xl relative group hover:border-primary/50 transition-colors">
                  
                  {/* Delete button (only show if not single editing and rows > 1) */}
                  {!scheduleData && rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="absolute -right-2 -top-2 bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="md:col-span-3">
                    <label className="block md:hidden text-xs font-semibold text-gray-500 mb-1">Mata Pelajaran</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Mata Pelajaran"
                      value={row.subject ?? ""}
                      onChange={(e) => updateRow(row.id, 'subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-medium"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block md:hidden text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      required 
                      value={row.exam_date ?? ""}
                      onChange={(e) => updateRow(row.id, 'exam_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:col-span-3">
                    <div>
                      <label className="block md:hidden text-xs font-semibold text-gray-500 mb-1">Jam Mulai</label>
                      <input 
                        type="time" 
                        required 
                        value={row.start_time ?? ""}
                        onChange={(e) => updateRow(row.id, 'start_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block md:hidden text-xs font-semibold text-gray-500 mb-1">Jam Selesai</label>
                      <input 
                        type="time" 
                        required 
                        value={row.end_time ?? ""}
                        onChange={(e) => updateRow(row.id, 'end_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block md:hidden text-xs font-semibold text-gray-500 mb-1">Ruang</label>
                    <input 
                      type="text" 
                      placeholder="Ruang"
                      value={row.room ?? ""}
                      onChange={(e) => updateRow(row.id, 'room', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-center h-full md:justify-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-1 md:mt-0">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={row.is_active ?? false}
                          onChange={(e) => updateRow(row.id, 'is_active', e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="block bg-gray-200 w-8 h-5 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform peer-checked:translate-x-3"></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 md:hidden">Aktif</span>
                    </label>
                  </div>

                </div>
              ))}
            </div>
            
          </div>
          
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors font-medium text-sm text-center"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="schedule-form"
            disabled={isLoading}
            className="w-full sm:w-auto justify-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {scheduleData ? 'Simpan Perubahan' : 'Simpan Semua Jadwal'}
          </button>
        </div>
      </div>
    </div>
  );
}
