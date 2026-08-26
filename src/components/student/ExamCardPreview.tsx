'use client';

import { StudentExamCardData } from '@/types/student';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import React from 'react';

// Load ExamCardPDFDownloadButton dynamically only on client side
const ExamCardPDFDownloadButton = dynamic(() => import('./ExamCardPDF'), { ssr: false });

interface Props {
  data: StudentExamCardData;
}

export default function ExamCardPreview({ data }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Group and sort schedules
  const sortedSchedules = [...data.schedules].sort((a, b) => {
    const dateDiff = new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.start_time.localeCompare(b.start_time);
  });

  const groupedSchedules: Record<string, typeof sortedSchedules> = {};
  sortedSchedules.forEach(sch => {
    if (!groupedSchedules[sch.exam_date]) {
      groupedSchedules[sch.exam_date] = [];
    }
    groupedSchedules[sch.exam_date].push(sch);
  });

  const hasSchedules = sortedSchedules.length > 0;
  
  // Adaptive styling based on number of schedules to fit in 1 page A4 Landscape
  const scheduleCount = sortedSchedules.length;
  const isCompact = scheduleCount > 7;
  const isVeryCompact = scheduleCount > 12;

  // CSS variables for dynamic scaling - Diperbesar khusus Data Peserta agar tidak ada ruang kosong di bawah
  const tableTextClass = isVeryCompact ? 'text-[7px] leading-[8px]' : isCompact ? 'text-[8px] leading-[10px]' : 'text-[9px] leading-[12px]';
  const tablePaddingClass = isVeryCompact ? 'px-1 py-0.5' : isCompact ? 'px-1.5 py-1' : 'px-2 py-1';
  const headerPaddingClass = isVeryCompact ? 'pb-1 mb-2' : isCompact ? 'pb-1.5 mb-2' : 'pb-2 mb-3';
  const gapClass = isVeryCompact ? 'h-0.5' : isCompact ? 'h-1' : 'h-1.5';
  
  // Data Peserta diperbesar maksimal tanpa melebihi judul (text-sm = 14px)
  const infoTextClass = 'text-[12px] md:text-[13px] leading-relaxed'; 
  const infoPaddingClass = 'py-1.5 md:py-2';

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait; /* Paksa kertas print HVS A4 biasa agar browser tidak memotong halaman (paginate) */
            margin: 5mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          body * {
            visibility: hidden;
          }
          #print-wrapper, #print-wrapper * {
            visibility: visible;
          }
          #print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important; /* Batas fisik di kertas A4 adalah 210mm (ukuran A5 landscape) */
            height: 148mm !important;
            overflow: hidden !important;
            margin: 0 !important;
          }
          #print-container {
            width: 297mm !important; /* Konten aslinya sebesar A4 landscape biar lega */
            height: 210mm !important; 
            transform: scale(0.707) !important; /* Perkecil persis ke ukuran A5 landscape (1 / sqrt(2)) */
            transform-origin: top left !important;
          }
        }
      `}} />

      <div className="p-4 md:p-8 print:p-0 w-full flex justify-center overflow-x-auto">
        
        {/* Outer Wrapper untuk membatasi ukuran fisik saat di-print (A5 Landscape) */}
        <div id="print-wrapper" className="print:w-[210mm] print:h-[148mm] print:overflow-hidden relative mx-auto shrink-0">
          
          {/* The Card - Di layar berukuran A4 Landscape, saat print akan di-scale jadi A5 Landscape */}
          <div 
            id="print-container"
            className="w-[297mm] h-[210mm] bg-white border border-gray-300 print:border-2 print:border-gray-800 shadow-xl print:shadow-none relative font-sans text-gray-900 flex flex-col"
          >

          {/* Content Wrapper */}
          <div className="relative z-10 p-6 md:p-8 print:p-0 w-full flex-1 flex flex-col">
            
            {/* Header Image Only (Borderless) */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-full">
                <img src="/header_gds.png" alt="Header SMK Ekonomika" className="w-full h-auto object-contain" />
              </div>
            </div>
            
            {/* Boxed Content (Now borderless since outer container has border) */}
            <div className="w-full flex-1 flex flex-col">
              
              {/* Title Block */}
              <div className="text-center w-full pb-1 pt-0 border-b border-gray-800"> 
                <h2 className="text-sm font-extrabold text-gray-900 uppercase">
                  KARTU PESERTA UJIAN
                </h2>
                <h3 className="text-xs font-bold text-gray-900 mt-0.5 uppercase">
                  {data.exam.exam_name} ({data.exam.semester})
                </h3>
                <p className="text-[10px] font-bold text-gray-900 mt-0.5 uppercase">
                  TAHUN PELAJARAN {data.exam.academic_year}
                </p>
              </div>

              {/* Main Content Body */}
              <div className="w-full flex-1 flex flex-col p-4 md:p-6 print:p-2">

          {/* Section 1: DATA PESERTA */}
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-800 pb-1 mb-2">
            DATA PESERTA
          </h3>
          
          {/* Identity & Exam Info Section */}
          <div className="flex justify-between items-start mb-2 gap-3">
            
            {/* Student Info */}
            <div className="flex-1">
              <table className={`font-semibold w-full max-w-md ${infoTextClass}`}>
                <tbody>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600 w-32 whitespace-nowrap`}>NISN</td>
                    <td className={`${infoPaddingClass} px-1 w-3`}>:</td>
                    <td className={`${infoPaddingClass} font-bold text-gray-900`}>{data.student.nisn}</td>
                  </tr>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600 w-32 whitespace-nowrap`}>Nama Lengkap</td>
                    <td className={`${infoPaddingClass} px-1 w-3`}>:</td>
                    <td className={`${infoPaddingClass} font-bold text-gray-900 uppercase`}>{data.student.full_name}</td>
                  </tr>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600 w-32 whitespace-nowrap`}>TTL</td>
                    <td className={`${infoPaddingClass} px-1 w-3`}>:</td>
                    <td className={`${infoPaddingClass} font-bold text-gray-900`}>
                      {data.student.place_of_birth || '-'}, {data.student.date_of_birth ? new Date(data.student.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600 w-32 whitespace-nowrap`}>Kelas / Jurusan</td>
                    <td className={`${infoPaddingClass} px-1 w-3`}>:</td>
                    <td className={`${infoPaddingClass} font-bold text-gray-900`}>{data.classInfo.class_name} / {data.classInfo.major}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Photo Placeholder */}
            {data.examSettings.show_photo && (
              <div className={`w-[2.5cm] h-[3.5cm] md:w-[3cm] md:h-[4cm] border-2 border-gray-800 p-1 flex-shrink-0 bg-gray-50 shadow-sm relative ${isVeryCompact ? 'hidden print:block print:w-[2.5cm] print:h-[3.5cm]' : ''}`}>
                {data.student.photo_url ? (
                  <img src={data.student.photo_url} alt="Pas Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full border border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-400">
                    <span className="text-[10px] md:text-xs font-medium">Pas Foto</span>
                    <span className="text-[10px] md:text-xs font-bold mt-0.5">3 × 4</span>
                  </div>
                )}
                {/* Stamp overlay */}
                <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full border border-gray-800/30 flex items-center justify-center opacity-50 -rotate-12">
                  <span className="text-[7px] font-bold text-gray-800/50">SMK</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Kotak-kotak (Nomor Ujian, Ruang Ujian, Password) */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="border border-gray-800 rounded-lg p-2 text-center flex flex-col justify-center min-h-[50px]">
              <p className="text-[8px] text-gray-500 uppercase font-semibold mb-0.5">Nomor Ujian</p>
              <p className="font-bold text-xs md:text-sm text-gray-900">{data.examCard.card_number}</p>
            </div>
            {data.examSettings.show_room && (
              <div className="border border-gray-800 rounded-lg p-2 text-center flex flex-col justify-center min-h-[50px]">
                <p className="text-[8px] text-gray-500 uppercase font-semibold mb-0.5">Ruang Ujian</p>
                <p className="font-bold text-xs md:text-sm text-gray-900">{data.student.exam_room || '-'}</p>
              </div>
            )}
            <div className="border border-gray-800 rounded-lg p-2 text-center flex flex-col justify-center min-h-[50px]">
              <p className="text-[8px] text-gray-500 uppercase font-semibold mb-0.5">Password</p>
              <p className="font-bold text-xs md:text-sm text-gray-900 tracking-wider">{data.student.exam_password || '-'}</p>
            </div>
          </div>

          {/* Schedule Table (Keep original purple design) */}
          {data.examSettings.show_schedule && (
            <div className="flex-1 flex flex-col">
              <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-800 pb-1 mb-2">
                JADWAL UJIAN PESERTA
              </h4>
              
              {hasSchedules ? (
                <div className="w-full overflow-hidden">
                  <table className={`w-full ${tableTextClass} border-collapse border-y-2 border-purple-800`}>
                    <thead>
                      <tr className="bg-purple-100 text-purple-900 border-b-2 border-purple-300">
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-left w-1/4 font-bold uppercase tracking-wide`}>Hari / Tanggal</th>
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-center w-1/6 font-bold uppercase tracking-wide`}>Waktu</th>
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-left font-bold uppercase tracking-wide`}>Mata Pelajaran</th>
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-center w-1/5 font-bold uppercase tracking-wide`}>Paraf Pengawas</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {Object.entries(groupedSchedules).map(([date, schedules], dateIndex) => (
                        <React.Fragment key={date}>
                          {schedules.map((sch, index) => (
                            <tr key={sch.id} className="hover:bg-gray-50 transition-colors">
                              {index === 0 && (
                                <td 
                                  rowSpan={schedules.length} 
                                  className={`border border-gray-300 ${tablePaddingClass} align-top font-semibold text-gray-800 bg-gray-50`}
                                >
                                  {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </td>
                              )}
                              <td className={`border border-gray-300 ${tablePaddingClass} text-center font-mono font-semibold text-gray-700`}>
                                {sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)}
                              </td>
                              <td className={`border border-gray-300 ${tablePaddingClass} font-bold text-gray-900`}>
                                {sch.subject}
                              </td>
                              <td className={`border border-gray-300 ${tablePaddingClass} text-center relative`}>
                                <div className="absolute inset-x-3 bottom-2 border-b border-dotted border-gray-400"></div>
                              </td>
                            </tr>
                          ))}
                          {/* Visual gap between dates */}
                          {dateIndex < Object.keys(groupedSchedules).length - 1 && (
                            <tr>
                              <td colSpan={4} className={`${gapClass} bg-gray-50/50 border-x border-gray-300 border-y-0`}></td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-gray-300 rounded text-center bg-gray-50 flex-1 flex items-center justify-center">
                  <p className="text-gray-500 font-medium text-sm">Tidak ada jadwal ujian untuk kelas ini.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer Notes & Signature */}
          <div className="mt-2 flex justify-between items-end text-[9px] pt-1 print:break-inside-avoid">
            <div className="flex-1 pr-4">
              {/* Box Ketentuan Ujian based on mockup */}
              <div className="bg-blue-50/50 border border-blue-200 p-2 rounded-lg max-w-xl">
                <p className="font-bold text-blue-900 text-[10px] mb-1">Ketentuan Ujian</p>
                <p className="text-[8px] text-blue-800 whitespace-pre-wrap leading-relaxed">{data.examSettings.exam_notes || '-'}</p>
                
                {data.exam.server_url && (
                  <div className="mt-1 pt-1 border-t border-blue-200/50">
                    <p className="text-[8px] text-blue-700 font-semibold mb-0.5">Link Server Ujian:</p>
                    <p className="font-mono text-[9px] font-bold text-blue-900 break-all">{data.exam.server_url}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-40 text-center flex flex-col items-center flex-shrink-0">
              <p className="mb-1 text-gray-800 text-xs md:text-sm">Mengetahui,</p>
              <p className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-sm md:text-base">Panitia Pelaksana</p>
              
              <div className="h-24 md:h-28 flex items-center justify-center mb-2 w-full">
                {data.examSettings.signature_url ? (
                  <img src={data.examSettings.signature_url} alt="Tanda Tangan" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="h-full"></div>
                )}
              </div>
              
              <p className="font-bold text-gray-900 border-b border-gray-800 w-full pb-1 uppercase text-xs md:text-sm truncate px-2">
                {data.examSettings.chairperson_name || '( .......................................... )'}
              </p>
            </div>
          </div>
          </div>
          </div>
          </div>
          {/* End Content Wrapper */}

        </div>
        </div>
      </div>
    </div>
  );
}
