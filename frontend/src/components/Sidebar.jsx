import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useTimerStore from '../store/timerStore';
import toast from 'react-hot-toast';
import { 
  Star, LayoutDashboard, Radio, Laptop, Clock, FileText, 
  CheckSquare, Calendar, LogIn, Plane, FolderKanban, Receipt, Users, 
  UsersRound, Settings, Blocks, Building2, UserPlus, HelpCircle, UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const isTracking = useTimerStore(state => state.isTracking);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (isTracking) {
      toast.error('Please stop time tracking before logging out.');
      return;
    }
    logout();
    navigate('/login');
  };

  const isActive = (paths) => {
    const activePaths = Array.isArray(paths) ? paths : [paths];
    return activePaths.includes(location.pathname);
  };

  const NavSection = ({ title }) => (
    <div className="px-6 py-2 mt-5">
      <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-widest">{title}</p>
    </div>
  );

  const NavItem = ({ to, icon: Icon, text, badge }) => (
    <Link to={to} className={`flex items-center px-4 py-2.5 mx-3 my-1 rounded-xl transition-all duration-200 text-[13px] font-bold ${isActive(to) ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20 transform scale-[1.02]' : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:scale-[1.01]'}`}>
      <Icon className={`w-[18px] h-[18px] mr-3 ${isActive(to) ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'}`} /> 
      <span className="flex-1">{text}</span>
      {badge && (
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ml-2 ${isActive(to) ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}>NEW</span>
      )}
    </Link>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 shadow-sm relative z-20 overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none"></div>

      {/* WorkforcePro Logo Header */}
      <div className="h-16 flex items-center px-6 relative z-10 border-b border-gray-50/50">
        <div className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 font-black text-2xl tracking-tighter">
          <svg className="w-7 h-7 mr-2 fill-current text-teal-500" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          WorkforcePro
        </div>
      </div>

      <div className="px-4 py-3 mt-4 border-b border-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 transition-colors mx-3 rounded-xl border border-gray-100 border-dashed group">
        <Star className="w-4 h-4 text-gray-300 mb-1 group-hover:text-yellow-400 transition-colors" />
        <span className="text-[11px] text-gray-500 font-semibold group-hover:text-gray-700">No favorites</span>
        <span className="text-[10px] text-gray-400">Click ☆ to pin</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar relative z-10">
        <NavSection title="Analyze" />
        <NavItem to="/" icon={LayoutDashboard} text="Dashboard" />
        {user?.role === 'Admin' && (
          <>
            <NavItem to="/live" icon={Radio} text="Live Feed" />
            <NavItem to="/work-packages" icon={Clock} text="Timesheets" />
            <NavItem to="/reports" icon={FileText} text="Reports" />
          </>
        )}

        <NavSection title="Manage" />
        <NavItem to="/attendance" icon={UserCheck} text="Attendance" badge="NEW" />
        {user?.role === 'Admin' ? (
          <NavItem to="/assign-work" icon={CheckSquare} text="Assign Tasks" />
        ) : (
          <NavItem to="/work-packages" icon={CheckSquare} text="Tasks" />
        )}
        <NavItem to="/leave-request" icon={Calendar} text="Leave Request" />
        <NavItem to="/projects" icon={FolderKanban} text="Projects" />
        {user?.role === 'Admin' && (
          <>
            <NavItem to="/invoice" icon={Receipt} text="Invoice" />
            <NavItem to="/clients" icon={UsersRound} text="Clients" badge="NEW" />
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <NavSection title="Admin" />
            <NavItem to="/screenshots" icon={Laptop} text="Screenshots" />
            <NavItem to="/teams" icon={Users} text="Teams" />
            <NavItem to="/admin" icon={UserPlus} text="Members" />
            <NavItem to="/payroll" icon={FileText} text="Payroll" />
            <NavItem to="/integrations" icon={Blocks} text="Integrations" badge="NEW" />
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
