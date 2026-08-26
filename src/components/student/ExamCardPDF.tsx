'use client';

import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { StudentExamCardData } from '@/types/student';
import React from 'react';

interface Props {
  data: StudentExamCardData;
  className?: string;
}

const MyDocument = ({ data }: Props) => {
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
  
  // Adaptive scaling logic based on number of schedules to fit in 1 page A4 Landscape
  const scheduleCount = sortedSchedules.length;
  const isCompact = scheduleCount > 7;
  const isVeryCompact = scheduleCount > 12;

  // Dynamic values (Diperbesar sesuai permintaan)
  const tableFontSize = 11;
  const tableHeaderFontSize = 11;
  const padV = 5;
  const padH = 6;
  const tableGapHeight = 6;
  const headerMarginBottom = 2; // Matches HTML
  const infoMarginBottom = 16;
  const footerMarginTop = 16;
  const photoWidth = 70;
  const photoHeight = 93;
  const sigLineMarginTop = 40;

  const styles = StyleSheet.create({
    page: {
      padding: '15 25',
      fontFamily: 'Helvetica',
      backgroundColor: '#ffffff',
    },
    card: {
      width: '100%',
      border: '2pt solid #1f2937',
      flexDirection: 'column',
    },
    headerImageContainer: {
      width: '100%',
      marginBottom: 0,
      borderBottom: '0pt solid #1f2937', // No border line below header image per latest request
    },
    titleBlock: {
      alignItems: 'center',
      paddingBottom: 6,
      paddingTop: 0,
      borderBottom: '2pt solid #1f2937',
    },
    titleText: {
      fontSize: 14,
      fontWeight: 'extrabold',
      color: '#111827',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    subTitleMain: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    subTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#111827',
      textTransform: 'uppercase',
    },
    bodyContainer: {
      paddingHorizontal: 20,
      paddingBottom: 15,
      paddingTop: 10,
    },
    body: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    infoContainer: {
      flex: 1,
      paddingRight: 10,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 6,
      fontSize: 11,
      alignItems: 'center',
    },
    infoLabel: {
      width: 95,
      color: '#4b5563',
    },
    infoColon: {
      width: 10,
    },
    infoValue: {
      flex: 1,
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '1pt solid #1f2937',
      paddingBottom: 6,
      marginBottom: 12,
    },
    boxesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    box: {
      flex: 1,
      border: '1pt solid #1f2937',
      borderRadius: 4,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    },
    boxLabel: {
      fontSize: 9,
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    boxValue: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
    },
    photoContainer: {
      width: photoWidth,
      height: photoHeight,
      border: '2pt solid #1f2937',
      padding: 1,
      backgroundColor: '#f9fafb',
    },
    photoTextContainer: {
      width: '100%',
      height: '100%',
      border: '1pt dashed #9ca3af',
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoText: {
      fontSize: 8,
      color: '#9ca3af',
    },
    photoTextBold: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#9ca3af',
      marginTop: 2,
    },
    scheduleContainer: {
      marginTop: 4,
    },
    scheduleTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '1pt solid #1f2937',
      paddingBottom: 6,
      marginBottom: 12,
    },
    table: {
      width: '100%',
      borderTop: '2pt solid #6b21a8',
      borderBottom: '2pt solid #6b21a8',
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableHeader: {
      backgroundColor: '#f3e8ff',
      borderBottom: '2pt solid #d8b4fe',
    },
    tableColHeader: {
      paddingVertical: padV,
      paddingHorizontal: padH,
      fontSize: tableHeaderFontSize,
      fontWeight: 'bold',
      color: '#4c1d95',
      textTransform: 'uppercase',
      borderRight: '1pt solid #e9d5ff',
      borderLeft: '1pt solid #e9d5ff',
    },
    tableColDate: { width: '25%' },
    tableColTime: { width: '18%', textAlign: 'center' },
    tableColSubject: { width: '37%' },
    tableColSignature: { width: '20%', textAlign: 'center' },
    tableCell: {
      paddingVertical: padV,
      paddingHorizontal: padH,
      fontSize: tableFontSize,
      borderRight: '1pt solid #d1d5db',
      borderLeft: '1pt solid #d1d5db',
      justifyContent: 'center',
    },
    tableCellDate: {
      paddingVertical: padV,
      paddingHorizontal: padH,
      fontSize: tableFontSize,
      borderRight: '1pt solid #d1d5db',
      borderLeft: '1pt solid #d1d5db',
      backgroundColor: '#f9fafb',
      fontWeight: 'bold',
      color: '#1f2937',
    },
    tableGap: {
      height: tableGapHeight,
      backgroundColor: '#f3f4f6',
      borderLeft: '1pt solid #d1d5db',
      borderRight: '1pt solid #d1d5db',
    },
    signatureCellLine: {
      borderBottom: '1pt dotted #9ca3af',
      width: '80%',
      alignSelf: 'center',
      marginTop: tableFontSize,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: footerMarginTop,
    },
    notesContainer: {
      flex: 1,
      paddingRight: 30,
    },
    notesBox: {
      border: '1pt solid #bfdbfe',
      backgroundColor: '#eff6ff',
      padding: 8,
      borderRadius: 4,
    },
    notesTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#1e3a8a',
    },
    notesText: {
      fontSize: 8,
      color: '#1e40af',
      lineHeight: 1.3,
    },
    serverUrlContainer: {
      marginTop: 6,
      paddingTop: 6,
      borderTop: '1pt solid #bfdbfe',
    },
    serverUrlLabel: {
      fontSize: 7,
      color: '#1d4ed8',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    serverUrlText: {
      fontSize: 9,
      color: '#1e3a8a',
      fontWeight: 'bold',
      fontFamily: 'Courier',
    },
    signatureContainer: {
      width: 180,
      alignItems: 'center',
    },
    signatureTitle: {
      fontSize: 11,
      color: '#1f2937',
      marginBottom: 3,
    },
    signatureRole: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#1f2937',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 5,
    },
    chairpersonName: {
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
      borderBottom: '1pt solid #111827',
      width: '100%',
      paddingBottom: 2,
    }
  });

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.card}>
          
          {/* Header Image */}
          <View style={styles.headerImageContainer}>
            <Image src="/header_gds.png" style={{ width: '100%', height: 'auto' }} />
          </View>
          
          {/* Title Block */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleText}>KARTU PESERTA UJIAN</Text>
            <Text style={styles.subTitleMain}>{data.exam.exam_name} ({data.exam.semester})</Text>
            <Text style={styles.subTitle}>TAHUN PELAJARAN {data.exam.academic_year}</Text>
          </View>

          {/* Content Body Wrapper */}
          <View style={styles.bodyContainer}>
            {/* Identity Section */}
            <Text style={styles.sectionTitle}>DATA PESERTA</Text>
            
            <View style={styles.body}>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>NISN</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{data.student.nisn}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nama Lengkap</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={[styles.infoValue, { textTransform: 'uppercase' }]}>{data.student.full_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>TTL</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>
                    {data.student.place_of_birth || '-'}, {data.student.date_of_birth ? new Date(data.student.date_of_birth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kelas / Jurusan</Text>
                  <Text style={styles.infoColon}>:</Text>
                  <Text style={styles.infoValue}>{data.classInfo.class_name} / {data.classInfo.major}</Text>
                </View>
              </View>

              {data.examSettings.show_photo && (
                <View style={styles.photoContainer}>
                  {data.student.photo_url ? (
                    <Image src={data.student.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <View style={styles.photoTextContainer}>
                      <Text style={styles.photoText}>Pas Foto</Text>
                      <Text style={styles.photoTextBold}>3 × 4</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.boxesRow}>
              <View style={styles.box}>
                <Text style={styles.boxLabel}>Nomor Ujian</Text>
                <Text style={styles.boxValue}>{data.examCard.card_number}</Text>
              </View>
              <View style={styles.box}>
                <Text style={styles.boxLabel}>Ruang Ujian</Text>
                <Text style={styles.boxValue}>{data.student.exam_room || '-'}</Text>
              </View>
              <View style={styles.box}>
                <Text style={styles.boxLabel}>Password</Text>
                <Text style={styles.boxValue}>{data.student.exam_password || '-'}</Text>
              </View>
            </View>

          {/* Schedule Table */}
          {data.examSettings.show_schedule && (
            <View style={styles.scheduleContainer}>
              <Text style={styles.scheduleTitle}>Jadwal Ujian Peserta</Text>
              
              {hasSchedules ? (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableColHeader, styles.tableColDate]}>Hari / Tanggal</Text>
                    <Text style={[styles.tableColHeader, styles.tableColTime]}>Waktu</Text>
                    <Text style={[styles.tableColHeader, styles.tableColSubject]}>Mata Pelajaran</Text>
                    <Text style={[styles.tableColHeader, styles.tableColSignature]}>Paraf Pengawas</Text>
                  </View>
                  
                  {Object.entries(groupedSchedules).map(([date, schedules], dateIndex) => (
                    <React.Fragment key={date}>
                      {schedules.map((sch, index) => {
                        const isLastInGroup = index === schedules.length - 1;
                        const dateCellBottom = isLastInGroup ? { borderBottom: '1pt solid #d1d5db' } : {};
                        const innerBottomBorder = { borderBottom: '1pt solid #d1d5db' };
                        
                        return (
                        <View style={styles.tableRow} key={sch.id}>
                          <View style={[styles.tableCellDate, styles.tableColDate, dateCellBottom]}>
                            <Text>{index === 0 ? new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableColTime, innerBottomBorder]}>
                            <Text style={{ fontFamily: 'Courier' }}>{sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)}</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableColSubject, innerBottomBorder, { fontWeight: 'bold' }]}>
                            <Text>{sch.subject}</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableColSignature, innerBottomBorder]}>
                            <View style={styles.signatureCellLine}></View>
                          </View>
                        </View>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 10, color: '#6b7280', padding: 20, textAlign: 'center', border: '1pt dashed #ccc' }}>
                  Tidak ada jadwal ujian untuk kelas ini.
                </Text>
              )}
            </View>
          )}

          {/* Footer Notes & Signature */}
          <View style={styles.footer}>
            <View style={styles.notesContainer}>
              {data.examSettings.exam_notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Ketentuan Ujian</Text>
                  <Text style={styles.notesText}>{data.examSettings.exam_notes}</Text>
                  
                  {data.exam.server_url && (
                    <View style={styles.serverUrlContainer}>
                      <Text style={styles.serverUrlLabel}>Link Server Ujian:</Text>
                      <Text style={styles.serverUrlText}>{data.exam.server_url}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.signatureContainer}>
              <Text style={styles.signatureTitle}>Mengetahui,</Text>
              <Text style={styles.signatureRole}>Panitia Pelaksana</Text>
              
              <View style={{ height: 80, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {data.examSettings.signature_url ? (
                  <Image src={data.examSettings.signature_url} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                ) : null}
              </View>
              
              <Text style={styles.chairpersonName}>{data.examSettings.chairperson_name || '( .......................................... )'}</Text>
            </View>
          </View>
          </View>

        </View>
      </Page>
    </Document>
  );
};

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';

export default function ExamCardPDFDownloadButton({ data, className }: Props) {
  return (
    <PDFDownloadLink
      document={<MyDocument data={data} />}
      fileName={`Kartu_Ujian_${data.student.nisn}.pdf`}
      className={className || "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"}
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <>
          <Download className="w-4 h-4" />
          {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}
