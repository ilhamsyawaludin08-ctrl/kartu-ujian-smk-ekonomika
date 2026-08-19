import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
      {/* Container */}
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center p-8 md:p-16 border border-primary/10">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="relative w-32 h-32 mb-6">
            <Image
              src="/images/logo.png"
              alt="Logo SMK Ekonomika"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Sistem Kartu Ujian Digital
          </h1>
          <p className="text-lg md:text-xl text-primary font-semibold tracking-wide">
            SMK Ekonomika
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Siswa Card */}
          <Link 
            href="/student"
            className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-primary/20 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 rotate-3 group-hover:rotate-0">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Portal Siswa</h2>
            <p className="text-sm text-gray-600 leading-relaxed px-2">
              Masuk dengan NISN untuk melihat dan mengunduh kartu ujian digital Anda.
            </p>
          </Link>

          {/* TU / Guru Card */}
          <Link 
            href="/login"
            className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-primary/20 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 -rotate-3 group-hover:rotate-0">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Login TU / Guru</h2>
            <p className="text-sm text-gray-600 leading-relaxed px-2">
              Masuk ke dashboard manajemen untuk mengelola data siswa dan kartu ujian.
            </p>
          </Link>

        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="font-bold text-primary tracking-widest mb-2 opacity-80">SAYA MAMPU MEMIMPIN</p>
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} SMK Ekonomika. All rights reserved.</p>
      </footer>
    </div>
  );
}
