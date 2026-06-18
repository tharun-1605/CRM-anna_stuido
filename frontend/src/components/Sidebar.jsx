import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useTimerStore from '../store/timerStore';
import useAttendanceStore from '../store/attendanceStore';
import toast from 'react-hot-toast';
import { 
  Star, Command, Activity, MonitorPlay, Timer, PieChart, 
  ListTodo, CalendarDays, LogIn, Plane, KanbanSquare, Receipt, Users, 
  Network, Settings, Puzzle, Building2, UserPlus, HelpCircle, ScanFace, CreditCard
} from 'lucide-react';

import { X } from 'lucide-react';

const NavSection = ({ title }) => (
  <div className="px-6 py-2 mt-5">
    <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-widest">{title}</p>
  </div>
);

const getGradient = (to) => {
  switch(to) {
    case '/': return 'from-blue-500 to-indigo-500 shadow-blue-500/20';
    case '/live': return 'from-rose-500 to-pink-500 shadow-rose-500/20';
    case '/work-packages': return 'from-orange-500 to-amber-500 shadow-orange-500/20';
    case '/reports': return 'from-emerald-500 to-teal-500 shadow-emerald-500/20';
    case '/attendance': return 'from-cyan-500 to-blue-500 shadow-cyan-500/20';
    case '/assign-work': return 'from-violet-500 to-purple-500 shadow-violet-500/20';
    case '/leave-request': return 'from-fuchsia-500 to-pink-500 shadow-fuchsia-500/20';
    case '/projects': return 'from-indigo-500 to-blue-500 shadow-indigo-500/20';
    case '/invoice': return 'from-green-500 to-emerald-500 shadow-green-500/20';
    case '/clients': return 'from-amber-500 to-orange-500 shadow-amber-500/20';
    case '/screenshots': return 'from-sky-500 to-cyan-500 shadow-sky-500/20';
    case '/teams': return 'from-purple-500 to-fuchsia-500 shadow-purple-500/20';
    case '/admin': return 'from-blue-500 to-indigo-500 shadow-blue-500/20';
    case '/payroll': return 'from-teal-500 to-emerald-500 shadow-teal-500/20';
    case '/integrations': return 'from-rose-500 to-orange-500 shadow-rose-500/20';
    default: return 'from-gray-400 to-gray-500 shadow-gray-500/20';
  }
};

const NavItem = ({ to, icon: Icon, text, badge, isActive, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center px-3 py-2 mx-3 my-1 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-[13px] font-bold group ${isActive ? 'bg-white/60 shadow-sm backdrop-blur-xl border border-white/80 scale-[1.02]' : 'hover:bg-white/40 hover:shadow-sm border border-transparent hover:scale-[1.01]'}`}>
    
    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center mr-3 transition-all duration-300 group-hover:scale-[1.15] group-hover:rotate-3 ${isActive ? `bg-gradient-to-br ${getGradient(to)} text-white shadow-lg` : `bg-white/80 text-gray-400 border border-gray-100 group-hover:text-gray-700 group-hover:border-white group-hover:shadow-md`}`}>
      <Icon className="w-[16px] h-[16px]" strokeWidth={2.5} /> 
    </div>
    
    <span className={`flex-1 ${isActive ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-800'}`}>{text}</span>
    
    {badge && (
      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full ml-2 bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-sm border border-teal-300/50">NEW</span>
    )}
  </Link>
);

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const isTracking = useTimerStore(state => state.isTracking);
  const todayRecord = useAttendanceStore(state => state.todayRecord);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (paths) => {
    const activePaths = Array.isArray(paths) ? paths : [paths];
    return activePaths.includes(location.pathname);
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/40 backdrop-blur-2xl border-r border-white/50 flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:relative transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none"></div>

      {/* WorkforcePro Logo Header */}
      <div className="h-16 flex items-center justify-between px-6 relative z-10 border-b border-gray-50/50">
        <div className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 font-black text-2xl tracking-tighter">
          <svg className="w-7 h-7 mr-2 fill-current text-teal-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          WorkforcePro
        </div>
        <button className="lg:hidden p-1 text-gray-400 hover:text-gray-600" onClick={() => setMobileMenuOpen?.(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 mt-4 border-b border-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 transition-colors mx-3 rounded-xl border border-gray-100 border-dashed group">
        <Star className="w-4 h-4 text-gray-300 mb-1 group-hover:text-yellow-400 transition-colors" />
        <span className="text-[11px] text-gray-500 font-semibold group-hover:text-gray-700">No favorites</span>
        <span className="text-[10px] text-gray-400">Click ☆ to pin</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar relative z-10">
        <NavSection title="Analyze" />
        <NavItem to="/" icon={Command} text="Dashboard" isActive={isActive('/')} onClick={() => setMobileMenuOpen?.(false)} />
        {user?.role === 'Admin' && (
          <>
            <NavItem to="/live" icon={Activity} text="Live Feed" isActive={isActive('/live')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/work-packages" icon={Timer} text="Timesheets" isActive={isActive('/work-packages')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/reports" icon={PieChart} text="Reports" isActive={isActive('/reports')} onClick={() => setMobileMenuOpen?.(false)} />
          </>
        )}

        <NavSection title="Manage" />
        <NavItem to="/attendance" icon={ScanFace} text="Attendance" badge="NEW" isActive={isActive('/attendance')} onClick={() => setMobileMenuOpen?.(false)} />
        {user?.role === 'Admin' ? (
          <NavItem to="/assign-work" icon={ListTodo} text="Assign Tasks" isActive={isActive('/assign-work')} onClick={() => setMobileMenuOpen?.(false)} />
        ) : (
          <NavItem to="/work-packages" icon={ListTodo} text="Tasks" isActive={isActive('/work-packages')} onClick={() => setMobileMenuOpen?.(false)} />
        )}
        <NavItem to="/leave-request" icon={CalendarDays} text="Leave Request" isActive={isActive('/leave-request')} onClick={() => setMobileMenuOpen?.(false)} />
        <NavItem to="/projects" icon={KanbanSquare} text="Projects" isActive={isActive('/projects')} onClick={() => setMobileMenuOpen?.(false)} />
        {user?.role === 'Admin' && (
          <>
            <NavItem to="/invoice" icon={Receipt} text="Invoice" isActive={isActive('/invoice')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/clients" icon={Users} text="Clients" badge="NEW" isActive={isActive('/clients')} onClick={() => setMobileMenuOpen?.(false)} />
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <NavSection title="Admin" />
            <NavItem to="/screenshots" icon={MonitorPlay} text="Screenshots" isActive={isActive('/screenshots')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/teams" icon={Network} text="Teams" isActive={isActive('/teams')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/admin" icon={UserPlus} text="Members" isActive={isActive('/admin')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/payroll" icon={CreditCard} text="Payroll" isActive={isActive('/payroll')} onClick={() => setMobileMenuOpen?.(false)} />
            <NavItem to="/integrations" icon={Puzzle} text="Integrations" badge="NEW" isActive={isActive('/integrations')} onClick={() => setMobileMenuOpen?.(false)} />
          </>
        )}

        <NavSection title="See More" />
        <div className="flex space-x-2 px-7 py-2">
           <button className="flex items-center text-[11px] font-bold text-gray-400 hover:text-teal-600 transition-colors"><UserPlus className="w-3.5 h-3.5 mr-1.5"/> Invite</button>
           <button className="flex items-center text-[11px] font-bold text-gray-400 hover:text-indigo-600 transition-colors ml-4"><HelpCircle className="w-3.5 h-3.5 mr-1.5"/> Support</button>
        </div>
        
        <div className="mt-6 px-6 border-t border-gray-100 pt-6 mb-4">
          <button 
            onClick={handleLogout}
            className="flex items-center text-[13px] text-gray-600 hover:text-red-600 font-bold transition-all hover:translate-x-1 w-full"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center mr-3 font-extrabold text-xs shadow-md shadow-pink-500/20">
              {user?.name?.substring(0,2).toUpperCase() || 'GU'}
            </div>
            Log Out
          </button>
        </div>
      </nav>
    </div>
  );
}
