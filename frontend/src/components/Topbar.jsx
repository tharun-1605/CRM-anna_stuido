import useTimerStore from '../store/timerStore';
import { Play, Square } from 'lucide-react';

export default function Topbar() {
  const { isTracking, elapsed, stopTracking } = useTimerStore();

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full shrink-0 flex flex-col z-10 relative">
      {/* Purple Trial Banner */}
      <div className="h-10 bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center text-[13px] text-gray-700">
        Your trial is ending on Jun 24, 2026
        <button className="ml-4 bg-gradient-to-r from-teal-400 to-indigo-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
          👑 Upgrade
        </button>
      </div>
      
      {/* White Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Active Timer Indicator */}
          {isTracking && (
            <div className="flex items-center bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 text-sm font-semibold animate-pulse shadow-sm">
               <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
               {formatTime(elapsed)}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Chat/Notification Icons */}
          <div className="flex space-x-3 text-gray-400">
            <svg className="w-5 h-5 hover:text-teal-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
