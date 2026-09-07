'use client';

import { X, Smartphone, Monitor, Printer, Lightbulb } from 'lucide-react';

interface PrintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintGuideModal({ isOpen, onClose }: PrintGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-purple-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#6a1b9a] to-[#8e24aa] px-6 py-5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg tracking-wide">Panduan Cetak Kartu Ujian</h3>
              <p className="text-purple-200 text-xs font-medium">Petunjuk mudah mencetak kartu sendiri / di fotokopi</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-700 text-sm">
          
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="w-8 h-8 rounded-full bg-[#6a1b9a] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              1
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                Pastikan Status Data &quot;Terverifikasi&quot;
              </h4>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Masukkan NISN Anda di portal siswa. Jika muncul tanda centang hijau <strong>DATA TERVERIFIKASI</strong>, klik tombol <strong>LIHAT KARTU UJIAN</strong>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="w-8 h-8 rounded-full bg-[#6a1b9a] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              2
            </div>
            <div className="space-y-3 w-full">
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                Pilih Cara Simpan File
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-sm flex items-start gap-2.5">
                  <Smartphone className="w-5 h-5 text-[#6a1b9a] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block mb-0.5">Jika Lewat HP:</span>
                    <p className="text-[11px] text-gray-600 leading-normal">
                      Klik tombol ungu <strong>Download PDF</strong>. File kartu ujian (.pdf) akan tersimpan di folder Unduhan HP Anda.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-sm flex items-start gap-2.5">
                  <Monitor className="w-5 h-5 text-[#6a1b9a] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block mb-0.5">Jika Lewat Laptop:</span>
                    <p className="text-[11px] text-gray-600 leading-normal">
                      Bisa langsung klik tombol <strong>Cetak</strong> atau klik <strong>Download PDF</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="w-8 h-8 rounded-full bg-[#6a1b9a] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              3
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                Kirim / Bawa File ke Tempat Print / Fotokopi
              </h4>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Kirimkan file PDF yang sudah didownload ke nomor <strong>WhatsApp abang fotokopi</strong> atau pindahkan menggunakan flashdisk.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="w-8 h-8 rounded-full bg-[#6a1b9a] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              4
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                Ketentuan Cetak di Printer
              </h4>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
                <li>Ukuran Kertas: <strong>A4</strong> (Kertas HVS 70 atau 80 gram).</li>
                <li>Orientasi Cetak: <strong>Portrait</strong> (Tegak).</li>
                <li>Warna: <strong>Berwarna (Color)</strong> agar logo & foto tampak jelas.</li>
                <li>Skala Cetak: <strong>Default / 100%</strong> (1 lembar penuh).</li>
              </ul>
            </div>
          </div>

          {/* Tips Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm leading-relaxed">
              <strong className="block font-bold mb-0.5">Pengingat Penting:</strong>
              Kartu ujian wajib dicetak dan dibawa setiap hari selama kegiatan ujian berlangsung sebagai tanda bukti kepesertaan.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#6a1b9a] hover:bg-[#5c2b90] text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
