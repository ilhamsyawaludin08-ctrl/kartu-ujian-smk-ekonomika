import { getUserProfile } from './actions';
import Link from 'next/link';
import { User, Shield, Info, Edit, Key, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Pengaturan | TU Dashboard',
};

export default async function SettingsPage() {
  const user = await getUserProfile();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-2">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[#5c2b90] hover:text-purple-800 font-medium transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pengaturan akun dan preferensi sistem Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil & Keamanan */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profil Akun */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Profil Akun</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-4">
                  <div className="text-sm text-gray-500">Nama Lengkap</div>
                  <div className="sm:col-span-2 text-sm font-medium text-gray-900 break-words">{user?.fullName || '-'}</div>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-4">
                  <div className="text-sm text-gray-500">Username</div>
                  <div className="sm:col-span-2 text-sm font-medium text-gray-900 break-words">{user?.username || '-'}</div>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-50 pb-4">
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="sm:col-span-2 text-sm font-medium text-gray-900 break-words">{user?.email || '-'}</div>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4">
                  <div className="text-sm text-gray-500">Role</div>
                  <div className="sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 w-full sm:w-auto">
                  <Edit className="w-4 h-4" />
                  Edit Profil
                </button>
              </div>
            </div>
          </div>

          {/* Keamanan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Keamanan</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-900 font-medium">Password Akun</p>
                <p className="text-sm text-gray-500 mt-1">
                  Gunakan password yang kuat untuk menjaga keamanan akun Anda.
                </p>
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full sm:w-auto">
                <Key className="w-4 h-4" />
                Ubah Password
              </button>
            </div>
          </div>
          
        </div>

        {/* Kolom Kanan: Info Sistem */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Informasi Sistem</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nama Sistem</div>
                  <div className="text-sm font-medium text-gray-900">Aplikasi Kartu Ujian</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Versi</div>
                  <div className="text-sm font-medium text-gray-900">v1.0.0</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sekolah</div>
                  <div className="text-sm font-medium text-gray-900">SMK Ekonomika</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tahun</div>
                  <div className="text-sm font-medium text-gray-900">2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
