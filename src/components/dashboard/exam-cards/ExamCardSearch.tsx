'use client';

import { useState } from 'react';
import { Search, Loader2, User, ChevronRight, AlertCircle } from 'lucide-react';
import { searchApprovedStudents } from '@/app/dashboard/exam-cards/actions';
import { fetchStudentCardData, CardActionResponse } from '@/app/student/actions';
import ExamCardPreview from '@/components/student/ExamCardPreview';
import { StudentExamCardData } from '@/types/student';

export default function ExamCardSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [cardData, setCardData] = useState<StudentExamCardData | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearched(true);
    setSelectedStudent(null);
    setCardData(null);
    setCardError(null);

    const res = await searchApprovedStudents(query.trim());
    if (res.success) {
      setStudents(res.data || []);
    } else {
      setStudents([]);
    }
    setIsSearching(false);
  };

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setIsLoadingCard(true);
    setCardError(null);
    setCardData(null);

    const res = await fetchStudentCardData(student.nisn);
    if (res.success) {
      // Sort schedules
      if (res.data.schedules) {
        res.data.schedules.sort((a, b) => {
          const dateA = new Date(a.exam_date).getTime();
          const dateB = new Date(b.exam_date).getTime();
          if (dateA !== dateB) return dateA - dateB;
          return a.start_time.localeCompare(b.start_time);
        });
      }
      setCardData(res.data);
    } else {
      setCardError(res.message || 'Gagal memuat kartu ujian.');
    }
    
    setIsLoadingCard(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Box */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Cari Siswa</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Masukkan NISN atau Nama Siswa..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cari'}
          </button>
        </form>

        {searched && students.length === 0 && !isSearching && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <p className="text-gray-500 text-sm">Tidak ada siswa yang ditemukan dengan status Approved.</p>
          </div>
        )}

        {students.length > 0 && !selectedStudent && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map(std => (
              <button 
                key={std.id}
                onClick={() => handleSelectStudent(std)}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-primary/50 hover:shadow-md rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate text-sm">{std.full_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{std.nisn} • {std.classes?.class_name}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result Section */}
      {selectedStudent && (
        <div className="space-y-6 print:m-0 print:p-0">
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-lg font-bold text-gray-900">
              Preview Kartu: <span className="text-primary">{selectedStudent.full_name}</span>
            </h3>
            <button 
              onClick={() => setSelectedStudent(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Kembali ke hasil pencarian
            </button>
          </div>

          {isLoadingCard && (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-gray-500 font-medium">Merakit kartu ujian...</p>
            </div>
          )}

          {cardError && !isLoadingCard && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-800">
                <h3 className="font-bold">Kartu Ujian Tidak Tersedia</h3>
                <p className="text-sm mt-1">{cardError}</p>
              </div>
            </div>
          )}

          {cardData && !isLoadingCard && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
              <div className="overflow-x-auto w-full print:overflow-visible">
                <div className="min-w-[800px] print:min-w-0">
                  <ExamCardPreview data={cardData} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
