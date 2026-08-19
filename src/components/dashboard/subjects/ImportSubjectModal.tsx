'use client';

import { useState } from 'react';
import { bulkImportSubjects } from '@/app/dashboard/subjects/actions';
import { Loader2, X, Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportSubjectModal({ isOpen, onClose }: ImportSubjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: 'Matematika',
        teacher_name: 'Budi Santoso, S.Pd'
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Mapel');
    XLSX.writeFile(wb, 'template_data_mapel.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Silakan pilih file Excel terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Map keys to expected format (name, teacher_name) in case they use Indonesian headers
      const mappedData = jsonData.map((row: any) => ({
        name: row['Mata Pelajaran'] || row.name || row['MataPelajaran'] || '',
        teacher_name: row['Nama Guru'] || row.teacher_name || row['NamaGuru'] || ''
      }));

      // JSON.parse(JSON.stringify) is REQUIRED by Next.js to pass plain objects to Server Actions
      const res = await bulkImportSubjects(JSON.parse(JSON.stringify(mappedData)));
      
      if (res.success) {
        setSuccess('Data berhasil diimport!');
        setTimeout(() => {
          onClose();
          setFile(null);
          setSuccess(null);
        }, 1500);
      } else {
        setError(res.error || 'Terjadi kesalahan saat import data');
      }
    } catch (err: any) {
      setError('Gagal membaca file Excel. Pastikan format sesuai template.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Import Data Mata Pelajaran</h2>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">
              {success}
            </div>
          )}

          <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Format File Excel
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              File Excel harus memiliki header kolom berikut pada baris pertama:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 mb-4 ml-1 space-y-1">
              <li><strong>name</strong> (Wajib)</li>
              <li><strong>teacher_name</strong> (Opsional)</li>
            </ul>
            <button 
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template Excel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel (.xlsx, .xls)</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <Upload className={`w-8 h-8 ${file ? 'text-primary' : 'text-gray-400'}`} />
                  {file ? (
                    <span className="text-sm font-medium text-primary">{file.name}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-700">Klik atau drag file ke sini</span>
                      <span className="text-xs text-gray-500">Maksimal 5MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium text-center"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !file}
                className="w-full sm:w-auto justify-center px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Import Data
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
