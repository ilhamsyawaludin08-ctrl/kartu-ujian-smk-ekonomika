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

  // CSS variables for dynamic scaling
  const tableTextClass = isVeryCompact ? 'text-[9px]' : isCompact ? 'text-[10px]' : 'text-xs';
  const tablePaddingClass = isVeryCompact ? 'px-2 py-1' : isCompact ? 'px-2 py-1.5' : 'px-3 py-2';
  const headerPaddingClass = isVeryCompact ? 'pb-2 mb-3' : isCompact ? 'pb-3 mb-4' : 'pb-4 mb-6';
  const gapClass = isVeryCompact ? 'h-1' : isCompact ? 'h-2' : 'h-3';
  const infoTextClass = isVeryCompact ? 'text-[10px]' : 'text-xs md:text-sm';
  const infoPaddingClass = isVeryCompact ? 'py-0.5' : 'py-1';

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm; /* Beri sedikit margin aman di kertas */
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          /* Hide everything outside print-container */
          body * {
            visibility: hidden;
          }
          #print-container, #print-container * {
            visibility: visible;
          }
          #print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 280mm !important; /* Paksa ukuran lebar landscape */
            max-width: 280mm !important;
            height: auto !important;
            margin: 0 !important; /* Jangan pakai margin yang mendorong elemen ke kanan */
          }
        }
      `}} />

      {/* Card Preview Container - A4 Landscape is 297mm x 210mm */}
      <div className="p-4 md:p-8 print:p-0 w-full flex justify-center">
        
        {/* The Card - A4 Landscape Dimensions */}
        <div 
          id="print-container"
          className="w-full max-w-[297mm] min-h-[210mm] print:min-h-0 bg-white border border-gray-300 print:border-0 shadow-xl print:shadow-none relative font-sans text-gray-900 mx-auto flex flex-col print:break-inside-avoid overflow-hidden"
        >
          {/* Footer / Background Image Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-end">
            <img src="/footer_gds.png" alt="Footer Background" className="w-full h-auto object-cover object-bottom" />
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10 p-6 md:p-8 print:p-0 print:pb-48 pb-48 w-full flex-1 flex flex-col">
            
            {/* Header */}
            <div className={`flex flex-col items-center justify-center border-b border-gray-800 ${headerPaddingClass}`}>
            <div className="w-full mb-3">
              <img src="/header_gds.png" alt="Header SMK Ekonomika" className="w-full h-auto object-contain" />
            </div>
            
            <div className="text-center w-full pb-2"> 
              <h2 className="text-base md:text-lg font-extrabold text-gray-900 uppercase">
                KARTU PESERTA
              </h2>
              <h3 className="text-sm md:text-base font-bold text-gray-900 mt-0.5 uppercase">
                {data.exam.exam_name} ({data.exam.semester})
              </h3>
              <p className="text-xs md:text-sm font-bold text-gray-900 mt-0.5 uppercase">
                TAHUN PELAJARAN {data.exam.academic_year}
              </p>
            </div>
          </div>

          {/* Main Content Body (with padding to avoid purple bar on the right) */}
          <div className="w-full flex-1 flex flex-col print:pr-28 print:pl-8 print:pt-4">

          {/* Section 1: DATA PESERTA */}
          <h3 className="font-bold text-sm md:text-base uppercase text-gray-900 border-b border-gray-800 pb-2 mb-4">
            DATA PESERTA
          </h3>
          
          {/* Identity & Exam Info Section */}
          <div className="flex justify-between items-start mb-4 md:mb-6 gap-6">
            
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
                    <td className={`${infoPaddingClass} pr-4 text-gray-600`}>Kelas / Jurusan</td>
                    <td className={`${infoPaddingClass} px-1`}>:</td>
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
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-800 rounded-lg p-3 text-center flex flex-col justify-center min-h-[80px]">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Nomor Ujian</p>
              <p className="font-bold text-lg text-gray-900">{data.examCard.card_number}</p>
            </div>
            <div className="border border-gray-800 rounded-lg p-3 text-center flex flex-col justify-center min-h-[80px]">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Ruang Ujian</p>
              <p className="font-bold text-lg text-gray-900">{data.student.exam_room || '-'}</p>
            </div>
            <div className="border border-gray-800 rounded-lg p-3 text-center flex flex-col justify-center min-h-[80px]">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Password</p>
              <p className="font-bold text-lg text-gray-900">{data.student.exam_password || '-'}</p>
            </div>
          </div>

          {/* Schedule Table (Keep original purple design) */}
          {data.examSettings.show_schedule && (
            <div className="flex-1 flex flex-col">
              <h4 className="font-bold text-xs md:text-sm uppercase text-gray-800 mb-2 bg-purple-50 inline-block px-3 py-1 border-l-4 border-purple-600">
                Jadwal Ujian Peserta
              </h4>
              
              {hasSchedules ? (
                <div className="w-full overflow-hidden">
                  <table className={`w-full ${tableTextClass} border-collapse border-y-2 border-purple-800`}>
                    <thead>
                      <tr className="bg-purple-100 text-purple-900 border-b-2 border-purple-300">
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-left w-1/4 font-bold uppercase tracking-wide`}>Hari / Tanggal</th>
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-center w-1/6 font-bold uppercase tracking-wide`}>Waktu</th>
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-left font-bold uppercase tracking-wide`}>Mata Pelajaran</th>
                        {data.examSettings.show_room && (
                          <th className={`border-x border-purple-200 ${tablePaddingClass} text-center w-1/6 font-bold uppercase tracking-wide`}>Ruangan</th>
                        )}
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-center w-1/6 font-bold uppercase tracking-wide`}>Paraf Pengawas</th>
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
                              {data.examSettings.show_room && (
                                <td className={`border border-gray-300 ${tablePaddingClass} text-center font-medium text-gray-700`}>
                                  {data.student.exam_room || '-'}
                                </td>
                              )}
                              <td className={`border border-gray-300 ${tablePaddingClass} text-center relative`}>
                                <div className="absolute inset-x-3 bottom-2 border-b border-dotted border-gray-400"></div>
                              </td>
                            </tr>
                          ))}
                          {/* Visual gap between dates */}
                          {dateIndex < Object.keys(groupedSchedules).length - 1 && (
                            <tr>
                              <td colSpan={data.examSettings.show_room ? 5 : 4} className={`${gapClass} bg-gray-50/50 border-x border-gray-300 border-y-0`}></td>
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
          <div className="mt-4 md:mt-6 flex justify-between items-end text-xs md:text-sm pt-2 print:break-inside-avoid">
            <div className="flex-1 pr-8 md:pr-12">
              {/* Box Ketentuan Ujian based on mockup */}
              <div className="bg-blue-50/50 border border-blue-200 p-3 md:p-4 rounded-lg max-w-xl">
                <p className="font-bold text-blue-900 text-sm mb-2">Ketentuan Ujian</p>
                <p className="text-xs text-blue-800 whitespace-pre-wrap leading-relaxed">{data.examSettings.exam_notes || '-'}</p>
                
                {data.exam.server_url && (
                  <div className="mt-3 pt-3 border-t border-blue-200/50">
                    <p className="text-[10px] text-blue-700 font-semibold mb-0.5">Link Server Ujian:</p>
                    <p className="font-mono text-xs font-bold text-blue-900 break-all">{data.exam.server_url}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-56 md:w-64 text-center flex flex-col items-center flex-shrink-0">
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
          {/* End Content Wrapper */}

        </div>
      </div>
    </div>
  );
}
