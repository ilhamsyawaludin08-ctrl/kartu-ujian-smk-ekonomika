'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Back Link */}
        <div className="w-full max-w-md mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Awal
          </Link>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-primary/10">
          <div className="p-8 md:p-10">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 p-2">
                <Image 
                  src="/images/logo.png" 
                  alt="Logo SMK Ekonomika" 
                  width={56} 
                  height={56} 
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Login Tata Usaha</h1>
              <p className="text-sm text-gray-500 mt-2 font-medium">Sistem Kartu Ujian SMK Ekonomika</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm bg-red-50 text-red-800 border border-red-200 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@smkekonomika.sch.id"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk Dashboard'
                )}
              </button>
            </form>
            
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="font-extrabold text-primary/80 tracking-[0.2em] mb-2 uppercase text-sm">Saya Mampu Memimpin</p>
        </div>
      </main>
    </div>
  );
}
