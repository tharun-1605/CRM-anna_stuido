import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useAuthStore from '../store/authStore';

export default function Layout() {
  const { user } = useAuthStore();
  
  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f6]">
      {user?.role === 'Admin' && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
