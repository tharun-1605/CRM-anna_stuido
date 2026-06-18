import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Calendar, Activity, Clock, Briefcase, Users, 
  Sparkles, TrendingUp, Zap, ArrowUpRight, BarChart4,
  Flame, Fingerprint, Layers
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import UserDashboard from './UserDashboard';
import toast from 'react-hot-toast';

const GlassCard = ({ children, className = '', delay = '0ms', glowColor = 'bg-teal-500' }) => (
  <div 
    className={`app-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-fade-in-up flex flex-col ${className}`}
    style={{ animationDelay: delay }}
  >
    <div className={`absolute -top-24 -right-24 w-48 h-48 ${glowColor} rounded-full mix-blend-multiply filter blur-[64px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none`}></div>
    <div className={`absolute -bottom-24 -left-24 w-48 h-48 ${glowColor} rounded-full mix-blend-multiply filter blur-[64px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none`}></div>
    <div className="relative z-10 w-full h-full flex flex-col flex-1">
      {children}
    </div>
  </div>
);

const EmptyState = ({ title, icon: Icon = Sparkles }) => (
  <div className="flex-1 w-full flex flex-col items-center justify-center py-8">
    <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
      <Icon className="w-8 h-8 text-gray-400 group-hover:text-teal-500 transition-colors duration-500" />
    </div>
    <p className="text-gray-500 text-sm font-semibold tracking-wide">{title}</p>
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
    <div className="max-w-7xl mx-auto space-y-6 py-4 px-2">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Admin Overview</h1>
            <p className="text-sm font-semibold text-gray-500 mt-0.5">Welcome back, {user?.name.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center px-4 py-2 bg-white/40 backdrop-blur-lg border border-white/60 text-gray-700 text-sm font-bold rounded-2xl shadow-sm">
          <Calendar className="w-4 h-4 mr-2 text-teal-500" />
          {formatDate(stats.dateRange.start)} - {formatDate(stats.dateRange.end)}
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard delay="0ms" glowColor="bg-teal-500">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
              <Clock className="w-5 h-5 text-teal-600"/>
            </div>
            <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${stats.hoursGrowth >= 0 ? 'bg-teal-100/50 text-teal-700 border-teal-200' : 'bg-red-100/50 text-red-700 border-red-200'}`}>
              {stats.hoursGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 transform rotate-180" />}
              {stats.hoursGrowth >= 0 ? '+' : ''}{stats.hoursGrowth}%
            </span>
          </div>
          <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-1">Total Hours</p>
          <h2 className="text-4xl font-black text-gray-800 tracking-tighter flex items-baseline">
            {stats.totalHoursWeek.toFixed(1)} <span className="text-lg text-gray-400 font-bold ml-1">h</span>
          </h2>
          
          <div className="flex items-end justify-between h-16 mt-8 space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {stats.weeklyChart.map((hours, i) => {
              const heightPercent = Math.max((hours / maxDailyHours) * 100, 4);
              return (
                <div key={i} className="w-full bg-teal-50/50 rounded-t-md h-full flex items-end overflow-hidden group/bar" title={`${hours.toFixed(1)} hours`}>
                   <div className="w-full bg-gradient-to-t from-teal-400 to-teal-500 rounded-t-md group-hover/bar:bg-gradient-to-t group-hover/bar:from-teal-300 group-hover/bar:to-teal-400 transition-colors" style={{height: `${heightPercent}%`}}></div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard delay="100ms" glowColor="bg-blue-500">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Briefcase className="w-5 h-5 text-blue-600"/>
            </div>
            <div className="p-1.5 rounded-full bg-white/50 border border-white/60 shadow-sm backdrop-blur-md">
               <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
          <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-1">Top Project</p>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight mb-2 truncate" title={stats.topProjectName}>
            {stats.topProjectName}
          </h2>
          <div className="mt-auto">
            <div className="inline-flex flex-col bg-white/40 backdrop-blur border border-white/60 rounded-xl p-3 w-full">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">Time Logged</span>
              <span className="text-xl font-bold text-blue-600">{stats.topProjectHours.toFixed(1)} <span className="text-sm text-gray-500">hrs</span></span>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay="200ms" glowColor="bg-purple-500">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <Users className="w-5 h-5 text-purple-600"/>
            </div>
            <div className="p-1.5 rounded-full bg-white/50 border border-white/60 shadow-sm backdrop-blur-md">
               <Layers className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </div>
          <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-1">Total Members</p>
          <h2 className="text-5xl font-black text-gray-800 tracking-tighter mb-4">
            {stats.totalMembers}
          </h2>
          <div className="mt-auto">
            <div className="inline-flex items-center justify-between bg-white/40 backdrop-blur border border-white/60 rounded-xl p-3 w-full">
              <span className="text-[11px] font-bold text-gray-500">System Active</span>
              <span className="text-sm font-bold text-emerald-500 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">100%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Leaderboard */}
        <GlassCard delay="300ms" glowColor="bg-orange-500">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100/50 pb-4">
            <h3 className="font-extrabold text-lg text-gray-800 flex items-center">
              <Flame className="w-5 h-5 text-orange-500 mr-2" /> Top Performers
            </h3>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider bg-white/50 px-2 py-1 rounded-lg border border-gray-100">This Week</span>
          </div>
          
          {stats.topUsers.length === 0 ? <EmptyState title="No time logged yet" icon={Flame} /> : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {stats.topUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/40 backdrop-blur border border-white/60 rounded-xl hover:bg-white/60 transition-colors group/row">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 flex items-center justify-center font-black text-xs mr-3 shadow-sm group-hover/row:scale-110 transition-transform">
                      #{i+1}
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{u.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-600 font-extrabold text-sm">{u.hours.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 font-bold ml-1">hrs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Live Attendance & Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlassCard delay="400ms" glowColor="bg-indigo-500">
             <div className="flex items-center justify-between border-b border-gray-100/50 pb-4 mb-5">
               <h3 className="font-extrabold text-lg flex items-center text-gray-800">
                 <Fingerprint className="w-5 h-5 mr-2 text-indigo-500" /> Attendance
               </h3>
             </div>
             
             <div className="space-y-4 flex-1 flex flex-col justify-center">
               <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur border border-white/60 rounded-xl hover:scale-[1.02] transition-transform">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full bg-yellow-400 mr-3 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span> 
                   <span className="text-gray-700 font-bold text-sm">On Time Off</span>
                 </div>
                 <div className="text-indigo-600 font-black bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{stats.attendance.onTimeOff}</div>
               </div>
               
               <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur border border-white/60 rounded-xl hover:scale-[1.02] transition-transform">
                 <div className="flex items-center">
                   <span className="relative flex h-3 w-3 mr-3">
                     {stats.attendance.clockedIn > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
                   </span>
                   <span className="text-gray-700 font-bold text-sm">Clocked In</span>
                 </div>
                 <div className="text-teal-600 font-black bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">{stats.attendance.clockedIn}</div>
               </div>
             </div>
          </GlassCard>
          
          <GlassCard delay="500ms" glowColor="bg-emerald-500" className="flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                 <Zap className={`w-5 h-5 text-emerald-500 ${stats.attendance.clockedIn > 0 ? 'animate-pulse' : ''}`}/>
               </div>
               <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider ${stats.attendance.clockedIn > 0 ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : 'bg-gray-100/50 text-gray-500 border-gray-200'}`}>
                 {stats.attendance.clockedIn > 0 ? 'Live Now' : 'Idle'}
               </span>
             </div>
             
             <div>
               <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-1">Status</p>
               <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight mb-4">
                 {stats.attendance.clockedIn > 0 ? 'Tracking Activity' : 'No Activity'}
               </h2>
               
               <div className="w-full bg-white/40 border border-white/60 h-3 rounded-full mb-2 overflow-hidden shadow-inner relative">
                 <div className={`h-full rounded-full w-full ${stats.attendance.clockedIn > 0 ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-pulse bg-[length:200%_100%]' : 'bg-gray-200'}`} style={stats.attendance.clockedIn > 0 ? {animation: 'liquidBackground 2s linear infinite'} : {}}></div>
               </div>
               <p className="text-[10px] font-bold text-gray-400 text-right">{new Date().toLocaleDateString()}</p>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
