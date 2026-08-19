import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F3E8FF] flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        
        {/* Footer for Dashboard */}
        <footer className="w-full py-4 text-center mt-auto print:hidden">
          <p className="text-gray-500 text-sm font-medium">© 2026 SMK Ekonomika. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
