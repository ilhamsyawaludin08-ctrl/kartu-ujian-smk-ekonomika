'use client';

import { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { updateStudentPhotoByNisn } from '@/app/dashboard/students/actions';
import { createClient } from '@/lib/supabase/client';

interface BulkPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadStatus {
  file: File;
  nisn: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export default function BulkPhotoUploadModal({ isOpen, onClose }: BulkPhotoUploadModalProps) {
  const [filesData, setFilesData] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newFilesData: UploadStatus[] = newFiles.map(file => {
      // Extract NISN by removing the file extension
      const nisn = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      return {
        file,
        nisn,
        status: 'pending'
      };
    });

    setFilesData(prev => [...prev, ...newFilesData]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFilesData(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    const supabase = createClient();

    for (let i = 0; i < filesData.length; i++) {
      const item = filesData[i];
      if (item.status === 'success') continue; // Skip already uploaded

      // Set uploading status
      setFilesData(prev => {
        const copy = [...prev];
        copy[i].status = 'uploading';
        return copy;
      });

      try {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${item.nisn}-${Date.now()}.${fileExt}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, item.file, {
            upsert: true,
          });

        if (uploadError) throw new Error(uploadError.message);

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('student-photos')
          .getPublicUrl(fileName);

        // 3. Update Student Record via Server Action
        const res = await updateStudentPhotoByNisn(item.nisn, publicUrl);
        
        if (!res.success) {
          throw new Error(res.error || 'Gagal menyimpan URL foto ke database');
        }

        // Success
        setFilesData(prev => {
          const copy = [...prev];
          copy[i].status = 'success';
          return copy;
        });

      } catch (err: any) {
        // Failed
        setFilesData(prev => {
          const copy = [...prev];
          copy[i].status = 'error';
          copy[i].errorMessage = err.message;
          return copy;
        });
      }
    }

    setIsUploading(false);
  };

  const successCount = filesData.filter(f => f.status === 'success').length;
  const pendingCount = filesData.filter(f => f.status === 'pending').length;
  const errorCount = filesData.filter(f => f.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Upload Massal Foto Siswa
            </h2>
            <p className="text-sm text-gray-500 mt-1">Ubah nama file foto menjadi NISN (contoh: 1234567890.jpg)</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Drag & Drop Area */}
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              id="bulk-photo-upload"
              onChange={onFileInput}
              disabled={isUploading}
            />
            <label htmlFor="bulk-photo-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Seret & Lepas foto di sini</h3>
              <p className="text-sm text-gray-500 mb-4">Atau klik untuk memilih file dari komputer Anda</p>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm">
                Pilih File Foto
              </span>
            </label>
          </div>

          {/* File List */}
          {filesData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Daftar Foto ({filesData.length})</h4>
                <div className="text-xs font-semibold flex gap-3">
                  <span className="text-gray-500">{pendingCount} Menunggu</span>
                  <span className="text-green-600">{successCount} Berhasil</span>
                  {errorCount > 0 && <span className="text-red-600">{errorCount} Gagal</span>}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {filesData.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3 bg-white hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img src={URL.createObjectURL(item.file)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.file.name}</p>
                      <p className="text-xs text-gray-500">NISN Terdeteksi: <span className="font-mono font-bold text-purple-700">{item.nisn}</span></p>
                      {item.errorMessage && (
                        <p className="text-xs text-red-500 truncate mt-0.5" title={item.errorMessage}>{item.errorMessage}</p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {item.status === 'pending' && (
                        <button onClick={() => removeFile(idx)} disabled={isUploading} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />}
                      {item.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Tutup
          </button>
          
          <button
            onClick={handleUploadAll}
            disabled={isUploading || pendingCount === 0}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Mulai Upload ({pendingCount})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
