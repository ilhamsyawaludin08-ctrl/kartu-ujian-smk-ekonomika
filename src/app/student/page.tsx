'use client';

import { useState } from 'react';
import { fetchStudentCardData, fetchStudentCardDataByExam, BasicStudentData, StudentExamOption } from './actions';
import { StudentExamCardData } from '@/types/student';
import ExamCardPreview from '@/components/student/ExamCardPreview';
import PrintGuideModal from '@/components/student/PrintGuideModal';
import { Loader2, Search, CheckCircle2, AlertTriangle, Printer, UserCircle, Info, HelpCircle, FileText, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const ExamCardPDFDownloadButton = dynamic(() => import('@/components/student/ExamCardPDF'), { ssr: false });

type UIState = 'SEARCH' | 'VERIFIED' | 'PENDING' | 'PREVIEW';

type ErrorResult = { success: false; error: 'not_found' | 'pending' | 'server_error'; message?: string; student?: BasicStudentData };

// Grid pilihan kartu menyesuaikan jumlah ujian (2–4)
const OPTION_GRID_COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2',
};

export default function StudentPortal() {
  const [uiState, setUiState] = useState<UIState>('SEARCH');
  const [nisn, setNisn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const [studentData, setStudentData] = useState<BasicStudentData | null>(null);
  const [cardData, setCardData] = useState<StudentExamCardData | null>(null);
  const [examOptions, setExamOptions] = useState<StudentExamOption[]>([]);
  const [loadingExamId, setLoadingExamId] = useState<number | null>(null);

  const applyCardData = (data: StudentExamCardData) => {
    setCardData(data);
    setStudentData({
      nisn: data.student.nisn,
      name: data.student.full_name,
      className: data.classInfo.class_name,
      major: data.classInfo.major,
      examNumber: data.examCard.card_number,
    });
  };

  const handleErrorResult = (res: ErrorResult) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setStudentData(null);
    setCardData(null);
    setExamOptions([]);

    const res = await fetchStudentCardData(nisn.trim());

    if (res.success) {
      setExamOptions(res.exams);

      if (res.exams.length === 1) {
        // Hanya 1 ujian: langsung ambil kartunya, tanpa halaman pilihan
        const detail = await fetchStudentCardDataByExam(nisn.trim(), res.exams[0].examId);
        if (detail.success) {
          applyCardData(detail.data);
          setUiState('VERIFIED');
        } else {
          handleErrorResult(detail);
        }
      } else {
        setStudentData(res.student);
        setUiState('VERIFIED');
      }
    } else {
      handleErrorResult(res);
    }

    setIsLoading(false);
  };

  const handleSelectExam = async (examId: number) => {
    setLoadingExamId(examId);
    setErrorMsg(null);

    const detail = await fetchStudentCardDataByExam(nisn.trim(), examId);

    if (detail.success) {
      setCardData(detail.data);
      setUiState('PREVIEW');
    } else if (detail.error === 'pending' && detail.student) {
      setStudentData(detail.student);
      setUiState('PENDING');
    } else {
      setErrorMsg(detail.message || 'Terjadi kesalahan pada server.');
    }

    setLoadingExamId(null);
  };

  const handleBackToExamOptions = () => {
    setCardData(null);
    setErrorMsg(null);
    setUiState('VERIFIED');
  };

  const handleBackToSearch = () => {
    setUiState('SEARCH');
    setStudentData(null);
    setCardData(null);
    setExamOptions([]);
    setNisn('');
    setErrorMsg(null);
  };

  const handlePrint = () => {
    window.print();
  };

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
    <div className="min-h-screen bg-[#f3e8ff] flex flex-col font-sans print:min-h-0 print:h-auto print:bg-white">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 print:p-0 print:bg-white print:justify-start print:min-h-0 print:h-auto">
        
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
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#6a1b9a] rounded-xl font-bold text-xs md:text-sm border border-purple-200 transition-all cursor-pointer shadow-2xs"
                >
                  <HelpCircle className="w-4 h-4 text-[#6a1b9a]" />
                  Cara Cetak Kartu di Fotokopi / Rumah
                </button>
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500">
                  <Info className="w-3.5 h-3.5" />
                  <span>Pastikan NISN yang dimasukkan sudah benar.</span>
                </div>
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

              {examOptions.length > 1 ? (
                <div className="w-full max-w-2xl mx-auto mt-8">
                  <h3 className="text-gray-900 text-lg font-extrabold tracking-wide mb-1">PILIH KARTU UJIAN</h3>
                  <p className="text-gray-500 text-sm font-medium mb-6">
                    Anda terdaftar di {examOptions.length} ujian aktif. Pilih kartu ujian yang ingin dilihat.
                  </p>

                  {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm bg-red-50 text-red-800 border border-red-200 text-left">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 ${OPTION_GRID_COLS[examOptions.length] || 'sm:grid-cols-2'} gap-4`}>
                    {examOptions.map((opt) => (
                      <div
                        key={opt.examId}
                        className="flex flex-col text-left bg-white border border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#6a1b9a] transition-all"
                      >
                        <div className="w-11 h-11 bg-purple-50 text-[#6a1b9a] rounded-xl flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-gray-900 text-sm md:text-base font-extrabold uppercase tracking-wide leading-snug break-words">
                            {opt.cardTitle}
                          </h4>
                          <p className="text-gray-500 text-xs md:text-sm font-medium mt-1.5 leading-relaxed break-words">
                            {opt.examName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectExam(opt.examId)}
                          disabled={loadingExamId !== null}
                          className="mt-5 w-full py-2.5 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {loadingExamId === opt.examId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lihat Kartu'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleBackToSearch}
                    className="mt-8 px-12 py-3 bg-white hover:bg-purple-50 text-[#6a1b9a] border border-[#6a1b9a] font-bold rounded-xl transition-all shadow-sm"
                  >
                    Kembali Ke Beranda
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setUiState('PREVIEW')}
                  className="mt-8 px-12 py-3 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold rounded-xl transition-all shadow-md"
                >
                  LIHAT KARTU UJIAN
                </button>
              )}
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
                  <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsGuideOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors font-bold text-sm shadow-sm cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Panduan Cetak</span>
                    </button>
                    {cardData.examSettings.allow_print && (
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#6a1b9a] border border-[#6a1b9a] rounded-xl hover:bg-purple-100 transition-colors font-bold text-sm shadow-sm cursor-pointer"
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
              <div className="w-full print:w-full flex justify-center border-t border-b md:border border-gray-200 py-6 md:p-6 bg-gray-50 md:rounded-xl print:p-0 print:border-none print:bg-transparent print:block">
                <ExamCardPreview data={cardData} />
              </div>

              {/* Preview Footer (Hidden in Print) */}
              <div className="mt-8 text-center print:hidden w-full">
                <p className="text-gray-500 text-sm font-medium mb-6">
                  Kartu ujian dibuat berdasarkan data siswa dan jadwal ujian yang telah diverifikasi.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {examOptions.length > 1 && (
                    <button
                      onClick={handleBackToExamOptions}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-purple-50 text-[#6a1b9a] border border-[#6a1b9a] font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali ke pilihan ujian
                    </button>
                  )}
                  <button
                    onClick={handleBackToSearch}
                    className="px-10 py-3 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Kembali Ke Beranda
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {renderFooter()}

      {/* Pop-up Modal Panduan Cetak */}
      <PrintGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />
    </div>
  );
}
