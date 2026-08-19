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
        
        {/* Login Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-primary/10">
          <div className="p-8 md:p-10">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center mb-6">
                <Image src="/logo.png" alt="Logo SMK Ekonomika" width={140} height={140} className="mb-4 object-contain" />
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
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'LOGIN'
                )}
              </button>
              
              <Link
                href="/"
                className="w-full bg-white hover:bg-gray-50 text-primary border-2 border-primary font-bold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-sm"
              >
                Kembali ke Halaman Awal
              </Link>
            </form>
            
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm font-medium">© 2026 SMK Ekonomika. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
