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
  const isCompact = scheduleCount > 16;
  const isVeryCompact = scheduleCount > 24;

  // CSS variables for dynamic scaling
  const tableTextClass = isVeryCompact ? 'text-[9px]' : isCompact ? 'text-[10px]' : 'text-xs';
  const tablePaddingClass = isVeryCompact ? 'px-2 py-1' : isCompact ? 'px-2 py-1.5' : 'px-3 py-2 print:py-1 print:px-2';
  const headerPaddingClass = isVeryCompact ? 'pb-2 mb-3' : isCompact ? 'pb-3 mb-4' : 'pb-4 mb-6';
  const gapClass = isVeryCompact ? 'h-1' : isCompact ? 'h-2' : 'h-3 print:h-1.5';
  const infoTextClass = isVeryCompact ? 'text-xs' : 'text-sm md:text-base';
  const infoPaddingClass = isVeryCompact ? 'py-1' : 'py-1.5 print:py-0.5';

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, header, footer, button, .no-print {
            display: none !important;
          }
          #print-container {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 auto !important;
            border: 2pt solid #1f2937 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: visible !important;
            zoom: 0.78 !important;
          }
          #print-container table th,
          #print-container table td {
            padding-top: 2.5px !important;
            padding-bottom: 2.5px !important;
          }
          #print-container .grid.grid-cols-3 > div {
            min-height: 0 !important;
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          #print-container .print-sig-container {
            height: 48px !important;
          }
        }
      `}} />

      {/* Card Preview Container - A4 Portrait is 210mm x 297mm */}
      <div className="p-4 md:p-8 print:p-0 w-full flex justify-center">
        
        {/* The Card - A4 Portrait Dimensions (matching PDF) */}
        <div 
          id="print-container"
          className="w-full max-w-[210mm] print:max-w-full min-h-0 bg-white border border-gray-300 print:border-2 print:border-gray-800 shadow-xl print:shadow-none relative font-sans text-gray-900 mx-auto flex flex-col print:break-inside-avoid overflow-hidden"
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
              <div className="text-center w-full pb-2 pt-0 border-b-2 border-gray-800"> 
                <h2 className="text-base md:text-lg font-extrabold text-gray-900 uppercase">
                  KARTU PESERTA UJIAN
                </h2>
                <h3 className="text-sm md:text-base font-bold text-gray-900 mt-0.5 uppercase">
                  {data.exam.exam_name} ({data.exam.semester})
                </h3>
                <p className="text-xs md:text-sm font-bold text-gray-900 mt-0.5 uppercase">
                  TAHUN PELAJARAN {data.exam.academic_year}
                </p>
              </div>

              {/* Main Content Body */}
              <div className="w-full flex-1 flex flex-col print:p-3 p-4">

          {/* Section 1: DATA PESERTA */}
          <h3 className="font-bold text-base md:text-lg uppercase text-gray-900 border-b border-gray-800 pb-2 mb-4 print:pb-1 print:mb-2">
            DATA PESERTA
          </h3>
          
          {/* Identity & Exam Info Section */}
          <div className="flex justify-between items-start mb-4 md:mb-6 print:mb-2 gap-6">
            
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
              <div className={`w-[2.5cm] h-[3.5cm] md:w-[3cm] md:h-[4cm] print:w-[2.2cm] print:h-[3cm] border-2 border-gray-800 p-1 flex-shrink-0 bg-gray-50 shadow-sm relative ${isVeryCompact ? 'hidden print:block print:w-[2.2cm] print:h-[3cm]' : ''}`}>
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
          <div className="grid grid-cols-3 gap-4 mb-6 print:gap-3 print:mb-2">
            <div className="border border-gray-800 rounded-lg p-3 print:py-1.5 print:px-2 text-center flex flex-col justify-center min-h-[80px] print:min-h-0">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Nomor Ujian</p>
              <p className="font-bold text-lg text-gray-900">{data.examCard.card_number}</p>
            </div>
            <div className="border border-gray-800 rounded-lg p-3 print:py-1.5 print:px-2 text-center flex flex-col justify-center min-h-[80px] print:min-h-0">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Ruang Ujian</p>
              <p className="font-bold text-lg text-gray-900">{data.student.exam_room || '-'}</p>
            </div>
            <div className="border border-gray-800 rounded-lg p-3 print:py-1.5 print:px-2 text-center flex flex-col justify-center min-h-[80px] print:min-h-0">
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Password</p>
              <p className="font-bold text-lg text-gray-900">{data.student.exam_password || '-'}</p>
            </div>
          </div>

          {/* Schedule Table (Keep original purple design) */}
          {data.examSettings.show_schedule && (
            <div className="flex-1 flex flex-col">
              <h4 className="font-bold text-base md:text-lg uppercase text-gray-900 border-b border-gray-800 pb-2 mb-4 print:pb-1 print:mb-2">
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
          <div className="mt-4 md:mt-6 print:mt-2.5 flex justify-between items-end text-xs md:text-sm pt-2 print:pt-1 print:break-inside-avoid">
            <div className="flex-1 pr-8 md:pr-12">
              {/* Box Ketentuan Ujian based on mockup */}
              <div className="bg-blue-50/50 border border-blue-200 p-3 md:p-4 print:p-2.5 rounded-lg max-w-xl">
                <p className="font-bold text-blue-900 text-sm mb-2 print:mb-1">Ketentuan Ujian</p>
                <p className="text-xs text-blue-800 whitespace-pre-wrap leading-relaxed">{data.examSettings.exam_notes || '-'}</p>
                
                {data.exam.server_url && (
                  <div className="mt-3 pt-3 print:mt-1.5 print:pt-1.5 border-t border-blue-200/50">
                    <p className="text-[10px] text-blue-700 font-semibold mb-0.5">Link Server Ujian:</p>
                    <p className="font-mono text-xs font-bold text-blue-900 break-all">{data.exam.server_url}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-56 md:w-64 print:w-48 text-center flex flex-col items-center flex-shrink-0">
              <p className="mb-1 print:mb-0.5 text-gray-800 text-xs md:text-sm">Mengetahui,</p>
              <p className="font-bold text-gray-900 mb-2 print:mb-1 uppercase tracking-wide text-sm md:text-base">Panitia Pelaksana</p>
              
              <div className="h-24 md:h-28 print:h-14 print-sig-container flex items-center justify-center mb-2 print:mb-1 w-full">
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
  );
}
