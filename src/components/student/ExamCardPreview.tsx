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
            size: A4 landscape;
            margin: 0; /* Menghilangkan URL dan header/footer bawaan browser */
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
            position: absolute;
            left: 0;
            top: 0;
            width: calc(100% - 20mm);
            height: auto;
            margin: 10mm;
          }
        }
      `}} />

      {/* Card Preview Container - A4 Landscape is 297mm x 210mm */}
      <div className="p-4 md:p-8 print:p-0 w-full flex justify-center">
        
        {/* The Card - A4 Landscape Dimensions */}
        <div 
          id="print-container"
          className="w-full max-w-[297mm] min-h-[210mm] bg-white border border-gray-300 print:border-0 shadow-xl print:shadow-none p-6 md:p-8 print:p-0 relative font-sans text-gray-900 mx-auto flex flex-col"
        >
          
          {/* Header */}
          <div className={`flex items-center gap-4 md:gap-6 border-b-[3px] border-purple-800 ${headerPaddingClass}`}>
            <div className="w-20 h-20 md:w-24 md:h-24 relative flex-shrink-0">
              <img src="/logo.png" alt="Logo SMK Ekonomika" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex-1 text-center pr-20 md:pr-24 print:pr-24"> 
              <h1 className="text-xl md:text-2xl font-extrabold text-purple-900 tracking-wider uppercase">
                {data.schoolProfile.school_name}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-600 font-medium mb-2 max-w-lg mx-auto">
                {data.schoolProfile.address}
              </p>
              
              <div className="inline-block mt-1">
                <h2 className="text-lg md:text-xl font-bold uppercase text-gray-900 tracking-widest border-b-2 border-gray-800 pb-0.5 mb-1">
                  KARTU PESERTA UJIAN
                </h2>
                <p className="text-xs md:text-sm font-bold text-purple-800 uppercase mt-1">
                  {data.examSettings.card_title || data.exam.exam_name}
                </p>
                <p className="text-[10px] md:text-xs font-semibold text-gray-600">
                  Tahun Ajaran {data.exam.academic_year} — Semester {data.exam.semester}
                </p>
              </div>
            </div>
          </div>

          {/* Identity & Exam Info Section */}
          <div className="flex justify-between items-start mb-4 md:mb-6 gap-6">
            
            {/* Student Info */}
            <div className="flex-1">
              <table className={`font-semibold w-full max-w-md ${infoTextClass}`}>
                <tbody>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600 w-32 whitespace-nowrap`}>Nama Peserta</td>
                    <td className={`${infoPaddingClass} px-1 w-3`}>:</td>
                    <td className={`${infoPaddingClass} font-bold uppercase text-gray-900 border-b border-gray-200`}>{data.student.full_name}</td>
                  </tr>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600`}>NISN</td>
                    <td className={`${infoPaddingClass} px-1`}>:</td>
                    <td className={`${infoPaddingClass} font-bold text-gray-900 border-b border-gray-200`}>{data.student.nisn}</td>
                  </tr>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600`}>Kelas / Jurusan</td>
                    <td className={`${infoPaddingClass} px-1`}>:</td>
                    <td className={`${infoPaddingClass} font-bold text-gray-900 border-b border-gray-200`}>{data.classInfo.class_name} - {data.classInfo.major}</td>
                  </tr>
                  <tr>
                    <td className={`${infoPaddingClass} pr-4 text-gray-600`}>Nomor Kartu</td>
                    <td className={`${infoPaddingClass} px-1`}>:</td>
                    <td className={`${infoPaddingClass}`}>
                      <span className="font-bold font-mono tracking-widest text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-1">
                        {data.examCard.card_number}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Exam Server Info (Optional) */}
            {data.exam.server_url && (
              <div className="hidden md:block print:block flex-1 max-w-sm border-l-2 border-purple-200 pl-4">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Informasi Server Ujian:</p>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                  <p className="text-[10px] text-gray-600">Link Akses Ujian:</p>
                  <p className="font-mono text-purple-700 font-bold text-xs break-all mt-1">{data.exam.server_url}</p>
                </div>
              </div>
            )}

            {/* Photo Placeholder */}
            {data.examSettings.show_photo && (
              <div className={`w-[2.5cm] h-[3.5cm] md:w-[3cm] md:h-[4cm] border-2 border-purple-800 p-1 flex-shrink-0 bg-gray-50 shadow-sm relative ${isVeryCompact ? 'hidden print:block print:w-[2.5cm] print:h-[3.5cm]' : ''}`}>
                {data.student.photo_url ? (
                  <img src={data.student.photo_url} alt="Pas Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full border border-dashed border-gray-400 flex flex-col items-center justify-center text-gray-400">
                    <span className="text-[10px] md:text-xs font-medium">Pas Foto</span>
                    <span className="text-[10px] md:text-xs font-bold mt-0.5">3 × 4</span>
                  </div>
                )}
                {/* Stamp overlay */}
                <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full border border-purple-800/30 flex items-center justify-center opacity-50 -rotate-12">
                  <span className="text-[7px] font-bold text-purple-800/50">SMK</span>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Table */}
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
                        <th className={`border-x border-purple-200 ${tablePaddingClass} text-center w-1/6 font-bold uppercase tracking-wide`}>Ruangan</th>
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
                              <td className={`border border-gray-300 ${tablePaddingClass} text-center font-medium text-gray-700`}>
                                {sch.room || '-'}
                              </td>
                              <td className={`border border-gray-300 ${tablePaddingClass} text-center relative`}>
                                <div className="absolute inset-x-3 bottom-2 border-b border-dotted border-gray-400"></div>
                              </td>
                            </tr>
                          ))}
                          {/* Visual gap between dates */}
                          {dateIndex < Object.keys(groupedSchedules).length - 1 && (
                            <tr>
                              <td colSpan={5} className={`${gapClass} bg-gray-50/50 border-x border-gray-300 border-y-0`}></td>
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
          <div className="mt-4 md:mt-6 flex justify-between items-end text-xs md:text-sm pt-2">
            <div className="flex-1 pr-8 md:pr-12">
              {data.examSettings.exam_notes && (
                <div className="border border-gray-300 p-2 md:p-3 bg-gray-50 rounded">
                  <p className="font-bold text-[10px] md:text-xs uppercase mb-1 text-gray-800 tracking-wider">Ketentuan Ujian:</p>
                  <p className="text-[9px] md:text-[10px] text-gray-700 whitespace-pre-wrap leading-relaxed">{data.examSettings.exam_notes}</p>
                </div>
              )}
            </div>
            
            <div className="w-48 md:w-56 text-center flex flex-col items-center flex-shrink-0">
              <p className="mb-1 text-gray-800 text-[10px] md:text-xs">Mengetahui,</p>
              <p className="font-bold text-gray-900 mb-12 md:mb-16 uppercase tracking-wide text-xs">Panitia Pelaksana</p>
              
              <p className="font-bold text-gray-900 border-b border-gray-800 w-full pb-1 uppercase text-[10px] md:text-xs truncate px-2">
                {data.examSettings.chairperson_name || '( .......................................... )'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
