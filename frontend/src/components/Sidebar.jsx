import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  Star, LayoutDashboard, Radio, Laptop, Clock, FileText, 
  CheckSquare, Calendar, LogIn, Plane, FolderKanban, Receipt, Users, 
  UsersRound, Settings, Blocks, Building2, UserPlus, HelpCircle, UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (paths) => {
    const activePaths = Array.isArray(paths) ? paths : [paths];
    return activePaths.includes(location.pathname);
  };

  const NavSection = ({ title }) => (
    <div className="px-5 py-2 mt-4">
      <p className="text-[11px] uppercase text-gray-400 font-semibold tracking-wider">{title}</p>
    </div>
  );

  const NavItem = ({ to, icon: Icon, text, badge }) => (
    <Link to={to} className={`flex items-center px-4 py-2.5 mx-2 my-0.5 rounded-md transition-colors text-[13px] font-medium ${isActive(to) ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon className={`w-[18px] h-[18px] mr-3 ${isActive(to) ? 'text-white' : 'text-gray-500'}`} /> 
      <span className="flex-1">{text}</span>
      {badge && (
        <span className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-2">NEW</span>
      )}
    </Link>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm relative z-20">
      
      {/* WorkforcePro Logo Header */}
      <div className="h-14 flex items-center px-6">
        <div className="flex items-center text-teal-500 font-bold text-xl tracking-tight">
          <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          WorkforcePro
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mx-2 rounded-md border border-gray-200 border-dashed">
        <Star className="w-4 h-4 text-gray-300 mb-1" />
        <span className="text-[11px] text-gray-500">No favorites</span>
        <span className="text-[10px] text-gray-400">Click ☆ to pin</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
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
        <NavItem to="/assign-work" icon={CheckSquare} text="Tasks" />
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
            <NavItem to="/organizations" icon={Building2} text="Organizations" />
            <NavItem to="/settings" icon={Settings} text="Settings" />
          </>
        )}

        <NavSection title="See More" />
        <div className="flex space-x-2 px-6 py-2">
           <button className="flex items-center text-[11px] text-gray-500 hover:text-teal-600"><UserPlus className="w-3 h-3 mr-1"/> Invite</button>
           <button className="flex items-center text-[11px] text-gray-500 hover:text-teal-600"><HelpCircle className="w-3 h-3 mr-1"/> Support</button>
        </div>
        
        <div className="mt-4 px-6 border-t border-gray-100 pt-4">
          <button 
            onClick={handleLogout}
            className="flex items-center text-[13px] text-gray-600 hover:text-red-600 font-medium transition-colors w-full"
          >
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center mr-3 font-bold text-xs">
              {user?.name?.substring(0,2).toUpperCase() || 'GU'}
            </div>
            Log Out
          </button>
        </div>
      </nav>
    </div>
  );
}
