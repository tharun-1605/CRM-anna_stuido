import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Trophy, Calendar, Activity, BarChart3, Clock, Briefcase, Users } from 'lucide-react';
import useAuthStore from '../store/authStore';
import UserDashboard from './UserDashboard';
import toast from 'react-hot-toast';

const EmptyStateCard = ({ title, icon: Icon = Trophy, colSpan = 1, children }) => (
  <div className={`app-card p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden group ${colSpan > 1 ? `md:col-span-${colSpan}` : ''} animate-fade-in-up`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors group-hover:bg-teal-50"></div>
    <div className="w-full flex justify-between items-center mb-6 self-start relative z-10">
      <h3 className="font-bold text-[15px] flex items-center text-gray-800">
        <Icon className="w-5 h-5 text-teal-500 mr-2" /> {title}
      </h3>
    </div>
    <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 transition-transform group-hover:-translate-y-2 duration-300">
      {children || (
        <>
          {/* Mountain Illustration SVG Placeholder */}
          <svg className="w-32 h-32 mb-4 opacity-80 mix-blend-multiply" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 60L40 160H160L100 60Z" fill="url(#paint0_linear)"/>
            <path d="M100 60L70 110L100 130L130 110L100 60Z" fill="url(#paint1_linear)"/>
            <circle cx="100" cy="50" r="10" fill="#f59e0b"/>
            <defs>
              <linearGradient id="paint0_linear" x1="100" y1="60" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14b8a6" />
                <stop offset="1" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="paint1_linear" x1="100" y1="60" x2="100" y2="130" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ccfbf1" stopOpacity="0.8"/>
                <stop offset="1" stopColor="#99f6e4" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
          </svg>
          <p className="text-gray-500 text-sm font-semibold">No data found.</p>
        </>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Admin') {
      const fetchStats = async () => {
        try {
          const { data } = await axios.get('/analytics/dashboard');
          setStats(data);
        } catch (error) {
          toast.error('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  if (user?.role !== 'Admin') {
    return <UserDashboard />;
  }

  if (loading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Helper to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const maxDailyHours = Math.max(...stats.weeklyChart, 8); // Minimum baseline for chart

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between animate-fade-in-up">
        <div className="flex items-center space-x-6 mb-4 sm:mb-0">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Admin Dashboard</h1>
        </div>
        <button className="flex items-center px-5 py-2.5 bg-white/80 backdrop-blur border border-teal-200 text-teal-700 text-sm font-semibold rounded-lg shadow-sm pointer-events-none">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(stats.dateRange.start)} - {formatDate(stats.dateRange.end)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Spans 2) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <EmptyStateCard title="Top Time Logged (Weekly)" icon={Clock}>
              {stats.topUsers.length === 0 ? undefined : (
                <div className="w-full space-y-3 mt-4">
                  {stats.topUsers.map((u, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border border-gray-100">
                      <span className="font-bold text-gray-800">{i+1}. {u.name}</span>
                      <span className="text-teal-600 font-bold">{u.hours.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              )}
            </EmptyStateCard>
            <EmptyStateCard title="Activity Reports" icon={Activity} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Total Hours */}
            <div className="app-card p-6 relative overflow-hidden animate-fade-in-up animate-stagger-1">
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[15px] text-gray-800 flex items-center"><Clock className="w-4 h-4 mr-2 text-teal-500"/> Total Hours</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${stats.hoursGrowth >= 0 ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {stats.hoursGrowth >= 0 ? '+' : ''}{stats.hoursGrowth}%
                </span>
              </div>
              <h2 className="text-3xl font-extrabold mb-6 text-gray-800">{stats.totalHoursWeek.toFixed(1)}h</h2>
              <div className="flex items-end justify-between h-20 space-x-2">
                 {stats.weeklyChart.map((hours, i) => {
                   const heightPercent = Math.max((hours / maxDailyHours) * 100, 2);
                   return (
                     <div key={i} className="w-full bg-gray-50 rounded-t-md h-full flex items-end overflow-hidden" title={`${hours.toFixed(1)} hours`}>
                        <div className="w-full bg-gradient-to-t from-teal-400 to-teal-500 rounded-t-md opacity-80" style={{height: `${heightPercent}%`}}></div>
                     </div>
                   );
                 })}
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>
              <p className="text-xs text-gray-400 mt-5 border-t border-gray-100/50 pt-4 font-medium">Total hours this week vs last</p>
            </div>

            {/* Most Hour Logged Project */}
            <div className="app-card p-6 relative overflow-hidden animate-fade-in-up animate-stagger-2">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[15px] text-gray-800 flex items-center"><Briefcase className="w-4 h-4 mr-2 text-blue-500"/> Top Project</h3>
              </div>
              <h2 className="text-xl font-extrabold mb-4 text-gray-800 truncate" title={stats.topProjectName}>{stats.topProjectName}</h2>
              <div className="bg-blue-50/50 rounded-lg p-4 mb-6 border border-blue-100/50">
                <p className="text-xs text-gray-500 mb-1 font-semibold">Total Time Logged</p>
                <p className="font-bold text-gray-800">{stats.topProjectHours.toFixed(1)} hrs</p>
              </div>
              <p className="text-xs text-gray-400 mt-auto border-t border-gray-100/50 pt-4 font-medium">Most Hour Logged Project</p>
            </div>

            {/* Members Overview */}
            <div className="app-card p-6 relative overflow-hidden animate-fade-in-up animate-stagger-3">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
               <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[15px] text-gray-800 flex items-center"><Users className="w-4 h-4 mr-2 text-purple-500"/> Total Members</h3>
              </div>
               <h2 className="text-4xl font-extrabold mb-4 mt-4 text-gray-800 tracking-tighter">{stats.totalMembers}</h2>
               <div className="bg-purple-50/50 rounded-lg p-4 mb-6 border border-purple-100/50">
                <p className="text-xs text-gray-500 mb-1 font-semibold">Active in System</p>
                <p className="font-bold text-gray-800">100%</p>
              </div>
              <p className="text-xs text-gray-400 mt-auto border-t border-gray-100/50 pt-4 font-medium">Total Registered Staff</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="app-card p-6 animate-fade-in-up animate-stagger-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center justify-between border-b border-gray-100/50 pb-4 mb-5 relative z-10">
               <h3 className="font-bold text-[15px] flex items-center text-gray-800">
                 <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Attendance (Today)
               </h3>
            </div>
            <p className="text-right text-sm font-bold text-gray-700 mb-6 bg-indigo-50 inline-block float-right px-3 py-1 rounded-full border border-indigo-100">Total Members: {stats.totalMembers}</p>
            <div className="clear-both"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-sm p-3 bg-white/60 border border-gray-100 rounded-lg">
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-3 shadow-sm"></span> <span className="text-gray-800 font-bold">On Time Off</span></div>
                <div className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded">{stats.attendance.onTimeOff}</div>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-white/60 border border-gray-100 rounded-lg">
                <div className="flex items-center">
                  <span className="relative flex h-2.5 w-2.5 mr-3">
                    {stats.attendance.clockedIn > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500 shadow-sm"></span>
                  </span>
                  <span className="text-gray-800 font-bold">Clocked In</span>
                </div>
                <div className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded">{stats.attendance.clockedIn}</div>
              </div>
            </div>
          </div>
          
          <div className="app-card p-6 animate-fade-in-up animate-stagger-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="flex items-center justify-between mb-6 relative z-10">
               <h3 className="font-bold text-[15px] text-gray-800 flex items-center"><Activity className="w-5 h-5 mr-2 text-emerald-500"/> Activity</h3>
               <span className="bg-emerald-50 text-emerald-600 font-bold text-xs px-2 py-1 rounded-full border border-emerald-100">{stats.attendance.clockedIn > 0 ? 'Active' : 'Idle'}</span>
             </div>
             <h2 className="text-2xl font-extrabold mb-5 text-gray-800 relative z-10">{stats.attendance.clockedIn > 0 ? 'Tracking Live' : 'No Activity'}</h2>
             <div className="w-full bg-gray-100 h-2.5 rounded-full mb-6 relative z-10 overflow-hidden shadow-inner">
               <div className={`h-full rounded-full w-full ${stats.attendance.clockedIn > 0 ? 'bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse' : 'bg-gray-200'}`}></div>
             </div>
             <div className="flex justify-between items-center border-t border-gray-100/50 pt-4 relative z-10">
               <p className="text-xs font-bold text-gray-500">{new Date().toLocaleDateString()}</p>
               <p className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Today's snapshot</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
