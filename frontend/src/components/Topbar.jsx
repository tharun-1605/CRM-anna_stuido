import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useTimerStore from '../store/timerStore';
import useAuthStore from '../store/authStore';
import useAttendanceStore from '../store/attendanceStore';
import { Play, Square, Bell, Search, LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

export default function Topbar({ setMobileMenuOpen }) {
  const isTracking = useTimerStore(state => state.isTracking);
  const elapsed = useTimerStore(state => state.elapsed);
  const stopTracking = useTimerStore(state => state.stopTracking);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const todayRecord = useAttendanceStore(state => state.todayRecord);
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const endpoint = user.role === 'Admin' ? '/work' : '/work/me';
          const [tasksRes, projectsRes] = await Promise.all([
            axios.get(endpoint),
            axios.get('/projects')
          ]);
          
          let notifs = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          tasksRes.data.forEach(task => {
            if (task.status !== 'Completed' && task.dueDate) {
              const due = new Date(task.dueDate);
              due.setHours(0, 0, 0, 0);
              if (due < today) {
                notifs.push({
                   _id: 'task_' + task._id,
                   type: 'Task',
                   name: task.name,
                   context: task.project?.name || '-',
                   date: task.dueDate
                });
              }
            }
          });

          projectsRes.data.forEach(project => {
            if (project.status !== 'Completed' && project.endDate) {
              const due = new Date(project.endDate);
              due.setHours(0, 0, 0, 0);
              if (due < today) {
                notifs.push({
                   _id: 'proj_' + project._id,
                   type: 'Project',
                   name: project.name,
                   context: project.client?.name || project.customer || '-',
                   date: project.endDate
                });
              }
            }
          });
          
          notifs.sort((a, b) => new Date(a.date) - new Date(b.date));
          setNotifications(notifs);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    let preventLogout = false;
    let message = '';

    if (isTracking) {
      preventLogout = true;
      message = 'Please stop time tracking before logging out.';
    } else if (todayRecord) {
      const isClockedIn = !!todayRecord.clockIn;
      const isClockedOut = !!todayRecord.clockOut;
      const isOnBreak = !!(todayRecord.breaks && todayRecord.breaks.find(b => !b.endTime));

      if (isClockedIn && !isClockedOut && !isOnBreak) {
        preventLogout = true;
        message = 'Please take a break or clock out before logging out.';
      }
    }

    if (preventLogout) {
      toast.error(message);
      return;
    }
    logout();
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full shrink-0 flex flex-col z-10 relative">

      
      {/* Glass Header */}
      <div className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/50 flex items-center px-4 md:px-8 shadow-sm relative z-50">
        {/* Mobile Hamburger Menu (Admin Only) */}
        {user?.role === 'Admin' && (
          <button 
            className="lg:hidden p-2 mr-2 text-gray-500 hover:text-teal-600 focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Left Side: Brand (for User) or Empty (for Admin since they have Sidebar) */}
        {user?.role !== 'Admin' && (
          <div className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 mr-4 md:mr-10 font-black text-lg md:text-xl tracking-tighter shrink-0">
            <svg className="w-6 h-6 mr-2 fill-current text-teal-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            WorkforcePro
          </div>
        )}

        {/* Center/Left: Navigation Links for Non-Admin */}
        {user?.role !== 'Admin' && (
          <nav className="flex items-center space-x-1 md:space-x-2 flex-1 overflow-x-auto custom-scrollbar pb-1">
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
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group">
                <Bell className="w-5 h-5 group-hover:text-teal-500 transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white"></span>
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length} Overdue</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm font-medium">No new notifications</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map(item => (
                          <div key={item._id} className="p-4 hover:bg-rose-50/30 transition-colors relative">
                            <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-md ${item.type === 'Project' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>{item.type}</span>
                            <p className="font-bold text-gray-800 text-sm pr-12">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.type === 'Project' ? 'Client: ' : 'Project: '}{item.context}</p>
                            <p className="text-xs text-rose-500 font-semibold mt-2">
                              Overdue since: {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {user?.role !== 'Admin' && (
              <button 
                onClick={handleLogout} 
                className="relative p-2 rounded-full hover:bg-red-50 text-gray-400 transition-colors group" 
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
              </button>
            )}
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
