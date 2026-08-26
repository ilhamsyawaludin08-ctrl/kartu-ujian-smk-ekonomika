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

  // Dynamic values (Kapasitas A3 - disesuaikan agar pas 1 halaman A5 landscape tanpa kepotong)
  const tableFontSize = 12;
  const tableHeaderFontSize = 12;
  const padV = 3;
  const padH = 8;
  const tableGapHeight = 2;
  const headerMarginBottom = 2;
  const infoMarginBottom = 4;
  const footerMarginTop = 4;
  const photoWidth = 80; // optimized size
  const photoHeight = 107; // 3:4 aspect ratio
  const sigLineMarginTop = 15;

  const styles = StyleSheet.create({
    page: {
      padding: 0,
      fontFamily: 'Helvetica',
      backgroundColor: '#ffffff',
    },
    scaledWrapper: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '420mm',
      height: '297mm',
      padding: '6mm 6mm', // Rapatkan margin horizontal/vertikal ke A5 agar selebar cetakan HTML
      transform: 'scale(0.5)',
      transformOrigin: '0 0',
    },
    card: {
      width: '100%',
      height: '100%',
      border: '2pt solid #1f2937',
      flexDirection: 'column',
    },
    headerImageContainer: {
      width: '100%',
      marginBottom: 0,
      borderBottom: '0pt solid #1f2937',
    },
    titleBlock: {
      alignItems: 'center',
      paddingBottom: 2,
      paddingTop: 0,
      borderBottom: '2pt solid #1f2937',
    },
    titleText: {
      fontSize: 18, // reduced from 20
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    subTitleMain: {
      fontSize: 14, // reduced from 16
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    subTitle: {
      fontSize: 12, // reduced from 14
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      textTransform: 'uppercase',
    },
    bodyContainer: {
      paddingHorizontal: 20,
      paddingBottom: 4,
      paddingTop: 4,
      flexGrow: 1,
    },
    body: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      minHeight: photoHeight, // force parent height to match photo to prevent Yoga overlap bug
      marginBottom: 6,
    },
    infoContainer: {
      flex: 1,
      paddingRight: 15,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 4, // dirapatkan dari 5 ke 4
      alignItems: 'center',
    },
    infoLabel: {
      width: 140,
      fontSize: 14, // reduced from 16
      fontFamily: 'Helvetica',
      color: '#4b5563',
    },
    infoColon: {
      width: 15,
      fontSize: 14, // reduced from 16
      fontFamily: 'Helvetica',
      color: '#4b5563',
    },
    infoValue: {
      flex: 1,
      fontSize: 14, // reduced from 16
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    sectionTitle: {
      fontSize: 16, // reduced from 18
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '1pt solid #1f2937',
      paddingBottom: 2,
      marginBottom: 4,
    },
    boxesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    box: {
      flex: 1,
      border: '2pt solid #1f2937', // Tebalkan border kotak sesuai HTML
      borderRadius: 6,
      padding: 4, // padding diturunkan agar tidak overflow vertikal
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    },
    boxLabel: {
      fontSize: 12, // reduced from 14
      fontFamily: 'Helvetica',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    boxValue: {
      fontSize: 22, // reduced from 26
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    photoContainer: {
      width: photoWidth,
      height: photoHeight,
      border: '2pt solid #1f2937',
      padding: 1,
      backgroundColor: '#f9fafb',
      position: 'relative', // so stampPlaceholder can absolute position inside it
    },
    photoTextContainer: {
      width: '100%',
      height: '100%',
      border: '1pt dashed #9ca3af',
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoText: {
      fontSize: 10, // reduced from 12
      fontFamily: 'Helvetica',
      color: '#9ca3af',
    },
    photoTextBold: {
      fontSize: 10, // reduced from 12
      fontFamily: 'Helvetica-Bold',
      color: '#9ca3af',
      marginTop: 2,
    },
    stampPlaceholder: {
      position: 'absolute',
      bottom: -15, // scaled down
      left: -15, // scaled down
      width: 70, // scaled down from 80
      height: 70, // scaled down from 80
      borderRadius: 35,
      border: '1pt solid #9ca3af',
      opacity: 0.3,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    stampText: {
      fontSize: 8, // reduced from 10
      color: '#9ca3af',
      transform: 'rotate(-45)',
      fontFamily: 'Helvetica',
    },
    scheduleContainer: {
      marginTop: 2, // reduced from 4
      flexGrow: 1,
    },
    scheduleTitle: {
      fontSize: 16, // reduced from 18
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '1pt solid #1f2937',
      paddingBottom: 2,
      marginBottom: 4,
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
    tableHeaderCell: {
      paddingVertical: padV,
      paddingHorizontal: padH,
      borderRight: '1pt solid #e9d5ff',
      borderLeft: '1pt solid #e9d5ff',
      justifyContent: 'center',
    },
    tableHeaderCellText: {
      fontSize: tableHeaderFontSize,
      fontFamily: 'Helvetica-Bold',
      color: '#4c1d95',
      textTransform: 'uppercase',
    },
    tableHeaderCellTextCenter: {
      fontSize: tableHeaderFontSize,
      fontFamily: 'Helvetica-Bold',
      color: '#4c1d95',
      textTransform: 'uppercase',
      textAlign: 'center',
      width: '100%',
    },
    tableColDate: { width: '25%' },
    tableColTime: { width: '18%' },
    tableColSubject: { width: '37%' },
    tableColSignature: { width: '20%' },
    tableCell: {
      paddingVertical: padV,
      paddingHorizontal: padH,
      borderRight: '1pt solid #d1d5db',
      borderLeft: '1pt solid #d1d5db',
      justifyContent: 'center',
    },
    tableCellDate: {
      paddingVertical: padV,
      paddingHorizontal: padH,
      borderRight: '1pt solid #d1d5db',
      borderLeft: '1pt solid #d1d5db',
      backgroundColor: '#f9fafb',
      justifyContent: 'center',
    },
    tableCellText: {
      fontSize: tableFontSize,
      fontFamily: 'Helvetica',
      color: '#1f2937',
    },
    tableCellTextCenter: {
      fontSize: tableFontSize,
      fontFamily: 'Helvetica',
      color: '#1f2937',
      textAlign: 'center',
      width: '100%',
    },
    tableCellTextBold: {
      fontSize: tableFontSize,
      fontFamily: 'Helvetica-Bold',
      color: '#1f2937',
    },
    tableCellTextDate: {
      fontSize: tableFontSize,
      fontFamily: 'Helvetica-Bold',
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
      alignItems: 'flex-end', // Aligment bottom persis seperti HTML items-end
      marginTop: footerMarginTop,
    },
    notesContainer: {
      flex: 1,
      paddingRight: 20,
    },
    notesBox: {
      border: '1pt solid #bfdbfe',
      backgroundColor: '#eff6ff',
      padding: 8, // reduced from 10
      paddingBottom: 16, // reduced from 20 but still generous enough
      borderRadius: 6,
    },
    notesTitle: {
      fontSize: 12, // reduced from 14
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
      color: '#1e3a8a',
    },
    notesText: {
      fontSize: 9, // reduced from 12 to save space and match HTML print note proportions
      fontFamily: 'Helvetica',
      color: '#1e40af',
      lineHeight: 1.3,
    },
    serverUrlContainer: {
      marginTop: 4, // reduced from 6
      paddingTop: 4, // reduced from 6
      borderTop: '1pt solid #bfdbfe',
    },
    serverUrlLabel: {
      fontSize: 8, // reduced from 10
      fontFamily: 'Helvetica-Bold',
      color: '#1d4ed8',
      marginBottom: 2,
    },
    serverUrlText: {
      fontSize: 11, // reduced from 14
      fontFamily: 'Courier',
      fontWeight: 'bold',
      color: '#1e3a8a',
    },
    signatureContainer: {
      width: 200,
      alignItems: 'center',
    },
    signatureTitle: {
      fontSize: 12, // reduced from 14
      fontFamily: 'Helvetica',
      color: '#1f2937',
      marginBottom: 4,
    },
    signatureRole: {
      fontSize: 13, // reduced from 16
      fontFamily: 'Helvetica-Bold',
      color: '#1f2937',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    chairpersonName: {
      fontSize: 12, // reduced from 14
      fontFamily: 'Helvetica-Bold',
      textAlign: 'center',
      textTransform: 'uppercase',
      borderBottom: '1pt solid #111827',
      width: '100%',
      paddingBottom: 4,
    }
  });

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View wrap={false} style={styles.scaledWrapper}>
          <View style={styles.card}>
            
            {/* Header Image */}
          <View style={styles.headerImageContainer}>
            <Image src="/header_gds.png" style={{ width: '100%' }} />
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
                  {/* School Stamp Placeholder */}
                  <View style={styles.stampPlaceholder}>
                    <Text style={styles.stampText}>Cap/Stempel</Text>
                  </View>
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
                    <View style={[styles.tableHeaderCell, styles.tableColDate]}>
                      <Text style={styles.tableHeaderCellText}>Hari / Tanggal</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableColTime]}>
                      <Text style={styles.tableHeaderCellTextCenter}>Waktu</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableColSubject]}>
                      <Text style={styles.tableHeaderCellText}>Mata Pelajaran</Text>
                    </View>
                    <View style={[styles.tableHeaderCell, styles.tableColSignature]}>
                      <Text style={styles.tableHeaderCellTextCenter}>Paraf Pengawas</Text>
                    </View>
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
                            <Text style={styles.tableCellTextDate}>{index === 0 ? new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableColTime, innerBottomBorder]}>
                            <Text style={[styles.tableCellTextCenter, { fontFamily: 'Courier' }]}>{sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)}</Text>
                          </View>
                          <View style={[styles.tableCell, styles.tableColSubject, innerBottomBorder]}>
                            <Text style={styles.tableCellTextBold}>{sch.subject}</Text>
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
              
              <View style={{ height: 45, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {data.examSettings.signature_url ? (
                  <Image src={data.examSettings.signature_url} style={{ width: 90, height: 45, objectFit: 'contain' }} />
                ) : null}
              </View>
              
              <Text style={styles.chairpersonName}>{data.examSettings.chairperson_name || '( .......................................... )'}</Text>
            </View>
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
