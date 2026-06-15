import { Link, useLocation } from 'react-router-dom';
import useTimerStore from '../store/timerStore';
import useAuthStore from '../store/authStore';
import { Play, Square } from 'lucide-react';

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
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
        {/* Left Side: Brand (for User) or Empty (for Admin since they have Sidebar) */}
        {user?.role !== 'Admin' && (
          <div className="flex items-center text-teal-600 mr-8 font-bold text-lg tracking-tight">
            WorkforcePro
          </div>
        )}

        {/* Center/Left: Navigation Links for Non-Admin */}
        {user?.role !== 'Admin' && (
          <nav className="flex items-center space-x-1 flex-1">
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
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Side: Timer & Icons */}
        <div className={`flex items-center space-x-4 ${user?.role === 'Admin' ? 'ml-auto' : ''}`}>
          {/* Active Timer Indicator */}
          {isTracking && (
            <div className="flex items-center bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 text-sm font-semibold animate-pulse shadow-sm">
               <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
               {formatTime(elapsed)}
            </div>
          )}

          {/* User Profile Info (for User) */}
          {user?.role !== 'Admin' && (
            <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.substring(0,2).toUpperCase() || 'GU'}
              </div>
            </div>
          )}

          {/* Chat/Notification Icons */}
          <div className="flex space-x-3 text-gray-400">
            <svg className="w-5 h-5 hover:text-teal-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
