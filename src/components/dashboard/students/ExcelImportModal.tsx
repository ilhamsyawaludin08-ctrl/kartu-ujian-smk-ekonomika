'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { bulkImportStudents } from '@/app/dashboard/students/actions';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExcelImportModal({ isOpen, onClose }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  
  // Field target di DB
  const dbFields = [
    { value: 'nisn', label: 'NISN' },
    { value: 'name', label: 'Nama Lengkap' },
    { value: 'class_id', label: 'Kelas / Jurusan' },
    { value: 'place_of_birth', label: 'Tempat Lahir' },
    { value: 'date_of_birth', label: 'Tanggal Lahir' },
    { value: 'exam_number', label: 'Nomor Ujian' },
    { value: 'exam_room', label: 'Ruang Ujian' },
    { value: 'exam_password', label: 'Password Ujian' },
    { value: 'ignore', label: 'Tidak Di-import (Abaikan)' },
    { value: 'unknown', label: 'Belum Ada di DB (Review Nanti)' }
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        const fileHeaders = data[0] as string[];
        setHeaders(fileHeaders);
        
        // Auto map basic fields if matched
        const autoMappings: Record<string, string> = {};
        fileHeaders.forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('nisn')) autoMappings[h] = 'nisn';
          else if (lower.includes('nama') || lower.includes('name')) autoMappings[h] = 'name';
          else if (lower.includes('kelas') || lower.includes('class')) autoMappings[h] = 'class_id';
          else if (lower.includes('tempat') || lower.includes('lahir') && !lower.includes('tanggal')) autoMappings[h] = 'place_of_birth';
          else if (lower.includes('tanggal') || lower.includes('tgl') || lower.includes('dob')) autoMappings[h] = 'date_of_birth';
          else if (lower.includes('nomor ujian') || lower.includes('no ujian')) autoMappings[h] = 'exam_number';
          else if (lower.includes('ruang') || lower.includes('room')) autoMappings[h] = 'exam_room';
          else if (lower.includes('password') || lower.includes('pass') || lower.includes('sandi')) autoMappings[h] = 'exam_password';
          else autoMappings[h] = 'unknown'; // default untuk field tak dikenal
        });
        
        setMappings(autoMappings);
        
        const allData = XLSX.utils.sheet_to_json(ws);
        setFullData(allData);
        // Ambil max 5 baris pertama untuk preview
        const preview = allData.slice(0, 5);
        setPreviewData(preview);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleMappingChange = (header: string, dbField: string) => {
    setMappings(prev => ({ ...prev, [header]: dbField }));
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    // transform data berdasarkan mappings
    const formattedData = fullData.map(row => {
       const mappedRow: any = {};
       Object.keys(mappings).forEach(header => {
          const targetField = mappings[header];
          if (targetField === 'unknown' || targetField === 'ignore') return;
          
          if (targetField === 'class_id') {
             mappedRow['class_name'] = row[header]; // pass name, backend resolves id
          } else {
             mappedRow[targetField] = row[header];
          }
       });
       return mappedRow;
    });

    const res = await bulkImportStudents(JSON.parse(JSON.stringify(formattedData)));
    setIsImporting(false);
    
    if (res.success) {
      alert("Import berhasil!");
      onClose();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Import Data Siswa
            </h2>
            <p className="text-sm text-gray-500 mt-1">Sistem dinamis mendeteksi kolom dari file Excel Anda.</p>
          </div>
          <button onClick={onClose} disabled={isImporting} className="text-gray-400 hover:bg-gray-200 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="excel-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="font-semibold text-gray-800 text-lg">Pilih File Excel</span>
                <span className="text-sm text-gray-500 mt-1">Mendukung .xlsx, .xls, atau .csv</span>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mapping Section */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <h3 className="font-bold text-sm">Mapping Kolom (Preview Mode)</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {headers.map((header, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                        <span className="font-medium text-sm text-gray-700 truncate w-1/2" title={header}>
                          {header}
                        </span>
                        <select 
                          className={`w-1/2 px-2 py-1.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary ${mappings[header] === 'unknown' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-300'}`}
                          value={mappings[header] || ''}
                          onChange={(e) => handleMappingChange(header, e.target.value)}
                        >
                          {dbFields.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  
                  {Object.values(mappings).includes('unknown') && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        <strong>Perhatian:</strong> Kolom berstatus "Belum Ada di DB" tidak akan dimasukkan. Pastikan Anda menyesuaikan mapping sebelum import.
                      </p>
                    </div>
                  )}
                  {Object.values(mappings).includes('class_id') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        <strong>Info Kelas:</strong> Data kelas berbentuk teks di Excel akan otomatis dideteksi atau dibuatkan relasi baru di dalam database.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Data */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-sm">Preview 5 Baris Pertama</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {headers.map(h => (
                          <th key={h} className="px-4 py-2 font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {headers.map(h => (
                            <td key={h} className="px-4 py-2 text-gray-600 truncate max-w-xs">{row[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            disabled={isImporting}
            className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors font-medium text-sm text-center disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            disabled={!file || isImporting}
            onClick={handleImport}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm flex items-center justify-center gap-2"
          >
            {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isImporting ? 'Memproses Import...' : 'Mulai Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
