'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/app/dashboard/actions';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-100 items-center justify-between px-6 lg:px-10 z-30 hidden lg:flex">
      <div className="text-gray-500 font-medium tracking-wide">
        Sistem Kartu Ujian
      </div>

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors focus:outline-none"
        >
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">Admin TU</p>
            <p className="text-xs text-gray-500">SMK Ekonomika</p>
          </div>
          <div className="w-10 h-10 bg-[#e0e7ff] text-[#3730a3] font-bold rounded-full flex items-center justify-center">
            A
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#5c2b90] transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-semibold">Edit Profil</span>
            </Link>
            
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left font-semibold"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-sm">Log Out</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
