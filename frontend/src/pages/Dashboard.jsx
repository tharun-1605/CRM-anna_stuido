import { Trophy, Calendar } from 'lucide-react';
import useAuthStore from '../store/authStore';
import UserDashboard from './UserDashboard';

const EmptyStateCard = ({ title, colSpan = 1 }) => (
  <div className={`app-card p-5 flex flex-col items-center justify-center min-h-[250px] ${colSpan > 1 ? `md:col-span-${colSpan}` : ''}`}>
    <div className="w-full flex justify-between items-center mb-6 self-start">
      <h3 className="font-semibold text-[15px] flex items-center text-gray-700">
        <Trophy className="w-4 h-4 text-yellow-500 mr-2" /> {title}
      </h3>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Mountain Illustration SVG Placeholder */}
      <svg className="w-32 h-32 mb-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 60L40 160H160L100 60Z" fill="#14b8a6"/>
        <path d="M100 60L70 110L100 130L130 110L100 60Z" fill="#ccfbf1"/>
        <circle cx="100" cy="50" r="10" fill="#fbbf24"/>
        <path d="M100 50V60" stroke="#fbbf24" strokeWidth="2"/>
        <path d="M100 50H120V30L100 50Z" fill="#fbbf24"/>
      </svg>
      <p className="text-gray-500 text-sm font-medium">No data found.</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  if (user?.role !== 'Admin') {
    return <UserDashboard />;
  }
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex bg-gray-100 rounded-md p-1 border border-gray-200">
            <button className="px-4 py-1 text-sm bg-white shadow-sm rounded text-gray-700 font-medium">Me</button>
            <button className="px-4 py-1 text-sm text-gray-500 hover:text-gray-700 rounded font-medium">Organization</button>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-blue-200 text-blue-600 text-sm rounded-md hover:bg-blue-50 transition-colors">
          Mon, June 08 - Sun, June 14, 2026 <span className="ml-2 bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">?</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Spans 2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <EmptyStateCard title="Top 5 Time Logged (Weekly)" />
            <EmptyStateCard title="Top 5 Activity (Weekly)" />
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Total Hours */}
            <div className="app-card p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-[15px] text-gray-700">Total Hours</h3>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">10%</span>
              </div>
              <h2 className="text-2xl font-bold mb-6">-</h2>
              <div className="flex items-end justify-between h-20 space-x-2">
                 {[0,0,0,0,0,0,0].map((_, i) => (
                   <div key={i} className="w-full bg-gray-100 rounded-t-sm h-full flex items-end">
                      <div className="w-full bg-gray-200 rounded-t-sm" style={{height: i===4?'30%':'0%'}}></div>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>
              <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">Total hours this week</p>
            </div>

            {/* Most Hour Logged Project */}
            <div className="app-card p-5">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded ml-auto">10%</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">-</h2>
              <div className="bg-gray-50 rounded p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Last Week</p>
                <p className="font-semibold text-gray-700">-</p>
              </div>
              <p className="text-xs text-gray-400 mt-auto border-t border-gray-100 pt-3">Most Hour Logged Project</p>
            </div>

            {/* Most Project Activity */}
            <div className="app-card p-5">
               <h2 className="text-3xl font-bold mb-4 mt-8">0%</h2>
               <div className="bg-gray-50 rounded p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Last Week</p>
                <p className="font-semibold text-gray-700">0%</p>
              </div>
              <p className="text-xs text-gray-400 mt-auto border-t border-gray-100 pt-3">Most Project Activity</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <EmptyStateCard title="Activity Report All Projects" />
            <EmptyStateCard title="Top Assigned Projects" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="app-card p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
               <h3 className="font-semibold text-[15px] flex items-center text-gray-700">
                 <Calendar className="w-4 h-4 mr-2 text-gray-500" /> Attendance (Today)
               </h3>
            </div>
            <p className="text-right text-sm font-semibold text-gray-700 mb-6">Total Members 1</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-3"></span> <span className="text-gray-700 font-medium">On Time Off</span></div>
                <div className="text-gray-400 italic">(None on time off)</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-300 mr-3"></span> <span className="text-gray-700 font-medium">Live</span></div>
                <div className="text-gray-400 italic">(None on live)</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-teal-500 mr-3"></span> <span className="text-gray-700 font-medium">Clocked In</span></div>
                <div className="text-gray-400 italic">(None clocked in)</div>
              </div>
            </div>
          </div>
          
          <div className="app-card p-5">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-[15px] text-gray-700">All Projects</h3>
               <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">10%</span>
             </div>
             <h2 className="text-xl font-bold mb-4">No Activity</h2>
             <div className="w-full bg-gray-200 h-2 rounded-full mb-4"></div>
             <p className="text-xs text-gray-400 mt-auto border-t border-gray-100 pt-3">June 14, 2026</p>
             <p className="text-xs text-gray-400 mt-1">Today's activity</p>
          </div>
        </div>

      </div>
    </div>
  );
}
