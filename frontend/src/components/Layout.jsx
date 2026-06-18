import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useAuthStore from '../store/authStore';

export default function Layout() {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {user?.role === 'Admin' && (
        <>
          {/* Mobile Overlay */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
