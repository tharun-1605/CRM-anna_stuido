import { Link, useLocation } from 'react-router-dom';
import useTimerStore from '../store/timerStore';
import useAuthStore from '../store/authStore';
import { Play, Square, Bell, Search } from 'lucide-react';

export default function Topbar() {
  const { isTracking, elapsed, stopTracking } = useTimerStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full shrink-0 flex flex-col z-10 relative">

      
      {/* White Header */}
      <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-8 shadow-sm">
        {/* Left Side: Brand (for User) or Empty (for Admin since they have Sidebar) */}
        {user?.role !== 'Admin' && (
          <div className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 mr-10 font-black text-xl tracking-tighter">
            <svg className="w-6 h-6 mr-2 fill-current text-teal-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            WorkforcePro
          </div>
        )}

        {/* Center/Left: Navigation Links for Non-Admin */}
        {user?.role !== 'Admin' && (
          <nav className="flex items-center space-x-2 flex-1">
            {[
              { path: '/', label: 'Dashboard' },
              { path: '/attendance', label: 'Attendance' },
              { path: '/work-packages', label: 'Tasks' },
              { path: '/leave-request', label: 'Leave Request' },
              { path: '/projects', label: 'Projects' }
            ].map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive(link.path) 
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20 transform scale-105' 
                    : 'text-gray-500 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Search Bar (Admin only for sleek look) */}
        {user?.role === 'Admin' && (
           <div className="flex-1 max-w-md hidden md:flex">
             <div className="relative w-full">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-gray-400" />
               </div>
               <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-100 rounded-full leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-teal-300 focus:ring-2 focus:ring-teal-100 sm:text-sm transition-all shadow-inner" placeholder="Search everywhere..." />
             </div>
           </div>
        )}

        {/* Right Side: Timer & Icons */}
        <div className={`flex items-center space-x-6 ${user?.role === 'Admin' ? 'ml-auto' : ''}`}>
          {/* Active Timer Indicator */}
          {isTracking && (
            <div className="flex items-center bg-gradient-to-r from-red-50 to-pink-50 text-red-600 px-4 py-2 rounded-full border border-red-100 text-sm font-extrabold animate-pulse shadow-sm">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2.5 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
               {formatTime(elapsed)}
            </div>
          )}

          {/* Chat/Notification Icons */}
          <div className="flex items-center space-x-4 text-gray-400">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group">
              <Bell className="w-5 h-5 group-hover:text-teal-500 transition-colors" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center pl-6 border-l border-gray-100">
            <div className="flex items-center cursor-pointer group">
              <div className="flex flex-col items-end mr-3 hidden sm:flex">
                <span className="text-sm font-bold text-gray-700 group-hover:text-teal-600 transition-colors">{user?.name || 'User'}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user?.role || 'Employee'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo-500/30 transform group-hover:scale-105 transition-all">
                {user?.name?.substring(0,2).toUpperCase() || 'GU'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
