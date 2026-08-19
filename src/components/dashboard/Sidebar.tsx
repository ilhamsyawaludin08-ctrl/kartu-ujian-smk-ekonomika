'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  Building
} from 'lucide-react';
import { logoutAction } from '@/app/dashboard/actions';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Siswa', href: '/dashboard/students', icon: Users },
  { name: 'Data Kelas', href: '/dashboard/classes', icon: BookOpen },
  { name: 'Jadwal Ujian', href: '/dashboard/schedules', icon: Calendar },
  { name: 'Pengaturan Ujian', href: '/dashboard/exams', icon: Settings },
  { name: 'Kartu Ujian', href: '/dashboard/exam-cards', icon: CreditCard },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || pathname.startsWith(item.href + '/');
            
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' 
                  : 'text-gray-600 hover:bg-primary/10 hover:text-primary font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
          <span className="font-extrabold text-primary text-lg">SMK Ekonomika</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="py-8 flex flex-col items-center justify-center px-4 border-b border-gray-100 bg-white">
          <div className="relative w-32 h-32 flex-shrink-0 mb-4">
            <Image src="/logo.png" alt="Logo SMK Ekonomika" fill className="object-contain" sizes="128px" priority />
          </div>
          <div className="flex flex-col justify-center text-center">
            <span className="text-xs font-bold text-[#5c2b90] uppercase tracking-widest">SISTEM KARTU UJIAN DIGITAL</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <NavLinks />
        </div>
      </aside>
    </>
  );
}
