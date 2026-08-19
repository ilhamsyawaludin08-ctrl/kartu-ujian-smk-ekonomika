'use client';

import { useState } from 'react';
import { fetchStudentCardData, CardActionResponse, BasicStudentData } from './actions';
import { StudentExamCardData } from '@/types/student';
import ExamCardPreview from '@/components/student/ExamCardPreview';
import { Loader2, Search, CheckCircle2, AlertTriangle, Printer, UserCircle, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

const ExamCardPDFDownloadButton = dynamic(() => import('@/components/student/ExamCardPDF'), { ssr: false });

type UIState = 'SEARCH' | 'VERIFIED' | 'PENDING' | 'PREVIEW';

export default function StudentPortal() {
  const [uiState, setUiState] = useState<UIState>('SEARCH');
  const [nisn, setNisn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [studentData, setStudentData] = useState<BasicStudentData | null>(null);
  const [cardData, setCardData] = useState<StudentExamCardData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setStudentData(null);
    setCardData(null);

    const res: CardActionResponse = await fetchStudentCardData(nisn.trim());

    if (res.success) {
      setCardData(res.data);
      setStudentData({
        nisn: res.data.student.nisn,
        name: res.data.student.full_name,
        className: res.data.classInfo.class_name,
        major: res.data.classInfo.major,
        examNumber: res.data.examCard.card_number,
      });
      setUiState('VERIFIED');
    } else {
      if (res.error === 'pending' && res.student) {
        setStudentData(res.student);
        setUiState('PENDING');
      } else if (res.error === 'not_found') {
        setErrorMsg('NISN tidak ditemukan. Silakan periksa kembali.');
      } else if (res.error === 'server_error' && res.student) {
        setStudentData(res.student);
        setErrorMsg(res.message || 'Terjadi kesalahan sistem.');
      } else {
        setErrorMsg(res.message || 'Terjadi kesalahan pada server.');
      }
    }

    setIsLoading(false);
  };

  const handleBackToSearch = () => {
    setUiState('SEARCH');
    setStudentData(null);
    setCardData(null);
    setNisn('');
    setErrorMsg(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderHeader = () => (
    <header className="bg-transparent print:hidden sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
          <span className="font-extrabold text-[#5c2b90] text-xl md:text-2xl tracking-wider">SMK EKONOMIKA</span>
        </div>
        <div className="flex items-center">
          <UserCircle className="w-9 h-9 text-[#5c2b90]" strokeWidth={1.5} />
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="bg-transparent print:hidden mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm font-medium">© 2026 SMK Ekonomika. All rights reserved.</p>
      </div>
    </footer>
  );

  const renderSummaryBox = (isApproved: boolean) => {
    if (!studentData) return null;
    
    return (
      <div className="bg-[#ffe8d6] rounded-xl p-5 md:p-6 w-full max-w-2xl mx-auto text-left shadow-sm border border-orange-100">
        <div className="flex justify-between items-center mb-4 border-b border-orange-200 pb-2">
          <span className="font-bold text-gray-900">Ringkasan Data Siswa</span>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-white ${isApproved ? 'bg-[#20c997]' : 'bg-[#ffca28] text-yellow-900'}`}>
            {isApproved ? 'APPROVED' : 'Belum di verifikasi'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm font-medium text-gray-800">
          <div>
            <div className="text-gray-900 mb-1">Nama lengkap :</div>
            <div className="font-bold">{studentData.name}</div>
          </div>
          <div>
            <div className="text-gray-900 mb-1">NISN :</div>
            <div className="font-bold">{studentData.nisn}</div>
          </div>
          <div>
            <div className="text-gray-900 mb-1">Kelas :</div>
            <div className="font-bold">{studentData.className}</div>
          </div>
          <div>
            <div className="text-gray-900 mb-1">Program Keahlian :</div>
            <div className="font-bold">{studentData.major}</div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-orange-200 text-center flex flex-col items-center justify-center">
          <div className="text-gray-900 mb-1">Nomor Ujian :</div>
          <div className="font-bold text-lg">{studentData.examNumber || '-'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3e8ff] flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 print:p-0 print:bg-white">
        
        {uiState === 'SEARCH' && (
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden print:hidden border border-purple-100 relative">
            <div className="p-8 md:p-12 text-center">
              <div className="flex flex-col items-center justify-center mb-6">
                <Image src="/logo.png" alt="Logo SMK Ekonomika" width={140} height={140} className="mb-4 object-contain" />
              </div>
              
              <h2 className="text-[#5c2b90] text-2xl font-extrabold tracking-wide mb-2">SELAMAT DATANG</h2>
              <p className="text-gray-600 text-sm mb-8 font-medium">Masukkan NISN untuk melihat kartu ujian Anda.</p>

              <form onSubmit={handleSubmit} className="text-left">
                <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                  Nomor Induk Siswa Nasional ( NISN )
                </label>
                
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-900" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#5c2b90] font-medium text-gray-900 outline-none"
                    placeholder="Masukan NISN"
                    autoComplete="off"
                  />
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm bg-red-50 text-red-800 border border-red-200">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !nisn.trim()}
                  className="w-full bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed mb-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Cari Kartu Ujian
                      <Search className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
                <Info className="w-4 h-4" />
                <span>Pastikan NISN yang dimasukkan sudah benar.</span>
              </div>
            </div>
          </div>
        )}

        {uiState === 'PENDING' && (
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden print:hidden border border-purple-100">
            <div className="p-8 md:p-12 text-center flex flex-col items-center">
              <div className="flex flex-col items-center justify-center mb-6">
                <Image src="/logo.png" alt="Logo SMK Ekonomika" width={140} height={140} className="mb-4 object-contain" />
              </div>

              <div className="w-16 h-16 bg-[#fff9c4] text-[#fbc02d] rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" strokeWidth={2.5} />
              </div>
              
              <h2 className="text-gray-900 text-xl font-extrabold tracking-wide mb-3">DATA BELUM DIVERIFIKASI</h2>
              <p className="text-gray-500 text-sm mb-8 font-medium max-w-md mx-auto leading-relaxed">
                Data Anda belum diverifikasi oleh Tata Usaha. Silakan kembali ke TU untuk melakukan verifikasi data sebelum mencetak kartu ujian.
              </p>

              {renderSummaryBox(false)}

              <button
                onClick={handleBackToSearch}
                className="mt-8 px-12 py-3 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold rounded-xl transition-all shadow-md"
              >
                Kembali Ke Beranda
              </button>
            </div>
          </div>
        )}

        {uiState === 'VERIFIED' && (
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden print:hidden border border-purple-100">
            <div className="p-8 md:p-12 text-center flex flex-col items-center">
              <div className="flex flex-col items-center justify-center mb-6">
                <Image src="/logo.png" alt="Logo SMK Ekonomika" width={140} height={140} className="mb-4 object-contain" />
              </div>

              <div className="w-16 h-16 bg-[#20c997] text-white rounded-full flex items-center justify-center mb-4 shadow-md">
                <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
              </div>
              
              <h2 className="text-gray-900 text-xl font-extrabold tracking-wide mb-3">DATA TERVERIFIKASI</h2>
              <p className="text-gray-500 text-sm mb-8 font-medium max-w-md mx-auto">
                Data anda telah terverifikasi oleh Tata Usaha
              </p>

              {renderSummaryBox(true)}

              <button
                onClick={() => setUiState('PREVIEW')}
                className="mt-8 px-12 py-3 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold rounded-xl transition-all shadow-md"
              >
                LIHAT KARTU UJIAN
              </button>
            </div>
          </div>
        )}

        {uiState === 'PREVIEW' && cardData && (
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none print:border-none print:bg-transparent border border-purple-100">
            <div className="p-6 md:p-10 flex flex-col items-center print:p-0">
              
              {/* Preview Header (Hidden in Print) */}
              <div className="w-full flex flex-col md:flex-row items-center justify-between mb-8 print:hidden gap-4">
                <div className="flex flex-col items-center md:items-start justify-center">
                  <Image src="/logo.png" alt="Logo SMK Ekonomika" width={140} height={140} className="mb-2 object-contain" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <h2 className="text-xl font-bold text-gray-900 w-full md:w-auto text-left mr-auto md:mr-8">
                    Preview Kartu Ujian
                  </h2>
                  <div className="flex gap-3 w-full md:w-auto justify-end">
                    {cardData.examSettings.allow_print && (
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#6a1b9a] border border-[#6a1b9a] rounded-xl hover:bg-purple-100 transition-colors font-bold text-sm shadow-sm"
                      >
                        <Printer className="w-4 h-4" />
                        Cetak
                      </button>
                    )}
                    {cardData.examSettings.allow_download && (
                      <ExamCardPDFDownloadButton 
                        data={cardData} 
                        className="flex items-center gap-2 px-4 py-2 bg-[#6a1b9a] text-white rounded-xl hover:bg-[#5c2b90] transition-colors font-bold text-sm shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* The Actual Card */}
              <div className="w-full print:w-full flex justify-center border-t border-b md:border border-gray-200 py-6 md:p-6 bg-gray-50 md:rounded-xl print:p-0 print:border-none print:bg-transparent">
                <ExamCardPreview data={cardData} />
              </div>

              {/* Preview Footer (Hidden in Print) */}
              <div className="mt-8 text-center print:hidden w-full">
                <p className="text-gray-500 text-sm font-medium mb-6">
                  Kartu ujian dibuat berdasarkan data siswa dan jadwal ujian yang telah diverifikasi.
                </p>
                <button
                  onClick={handleBackToSearch}
                  className="px-10 py-3 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Kembali Ke Beranda
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {renderFooter()}
    </div>
  );
}
