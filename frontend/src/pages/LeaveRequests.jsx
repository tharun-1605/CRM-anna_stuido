import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Calendar, CalendarClock, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export default function LeaveRequests() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  
  const [leaves, setLeaves] = useState([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedUserId, setSelectedUserId] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');

  const fetchLeaves = async () => {
    try {
      const endpoint = isAdmin ? '/leaves' : '/leaves/me';
      const { data } = await axios.get(endpoint);
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    }
  };

  const fetchUsers = async () => {
    try {
      if (isAdmin) {
        const { data } = await axios.get('/auth/users');
        setUsers(data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (user?._id && !selectedUserId) {
      setSelectedUserId(user._id);
    }
  }, [user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/leaves/${id}`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmitLeave = async () => {
    if (!date || !reason) return toast.error('Fill required fields');
    try {
      await axios.post('/leaves', { date, reason, type: leaveType });
      toast.success('Time off applied successfully');
      setDate('');
      setReason('');
      setLeaveType('Casual Leave');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to apply time off');
    }
  };

  const handleExport = () => {
    const exportData = leaves.map(l => ({
      Date: new Date(l.date).toLocaleDateString(),
      User: l.user?.name || 'Unknown',
      Email: l.user?.email || '',
      Type: l.type || 'Casual Leave',
      Reason: l.reason,
      Status: l.status
    }));
    exportToCSV(exportData, 'LeaveRequests_Export');
  };

  // Get unique years from leave requests to populate year filter, including current year by default
  const availableYears = Array.from(new Set([
    new Date().getFullYear(),
    ...leaves.map(l => new Date(l.date).getFullYear())
  ])).sort((a, b) => b - a);

  // Active user to display in balance cards
  const activeUserId = selectedUserId || user?._id;

  // Filter approved leaves for selected user and selected year
  const userLeaves = leaves.filter(l => {
    const leaveUser = l.user;
    if (!leaveUser) return false;
    const leaveUserId = typeof leaveUser === 'object' ? leaveUser._id : leaveUser;
    const userIdMatch = leaveUserId === activeUserId;
    const yearMatch = new Date(l.date).getFullYear() === Number(selectedYear);
    return userIdMatch && yearMatch && l.status === 'APPROVED';
  });

  const sickLeavesUsed = userLeaves.filter(l => l.type === 'Sick Leave').length;
  const casualLeavesUsed = userLeaves.filter(l => l.type === 'Casual Leave').length;

  const sickLeaveRemaining = 8 - sickLeavesUsed;
  const casualLeaveRemaining = 12 - casualLeavesUsed;

  // Helper for team directory
  const getMemberLeaveDetails = (memberId) => {
    const memberApprovedLeaves = leaves.filter(l => {
      const leaveUser = l.user;
      if (!leaveUser) return false;
      const leaveUserId = typeof leaveUser === 'object' ? leaveUser._id : leaveUser;
      const userIdMatch = leaveUserId === memberId;
      const yearMatch = new Date(l.date).getFullYear() === Number(selectedYear);
      return userIdMatch && yearMatch && l.status === 'APPROVED';
    });

    const sickUsed = memberApprovedLeaves.filter(l => l.type === 'Sick Leave').length;
    const casualUsed = memberApprovedLeaves.filter(l => l.type === 'Casual Leave').length;
    
    return {
      sickUsed,
      sickRemaining: 8 - sickUsed,
      casualUsed,
      casualRemaining: 12 - casualUsed
    };
  };

  // Filter leaves history table based on selectedUserId
  const filteredLeavesForTable = leaves.filter(l => {
    if (!selectedUserId) return true;
    const leaveUser = l.user;
    if (!leaveUser) return false;
    const leaveUserId = typeof leaveUser === 'object' ? leaveUser._id : leaveUser;
    return leaveUserId === selectedUserId;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-teal-500" />
          {isAdmin ? 'Time Off Requests' : 'Time Off'}
        </h1>
        {isAdmin && (
          <button onClick={handleExport} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        )}
      </div>

      {/* Leave Balance Summary Cards */}
      <div className="app-card p-6 mb-6 animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-indigo-50/20 to-teal-50/20 border border-white/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-extrabold text-gray-800 text-lg tracking-tight">Leave Balance Summary</h3>
            <p className="text-xs font-medium text-gray-400">Track and monitor annual leave balances</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee:</span>
                <select 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)} 
                  className="app-input px-3 py-1.5 text-xs bg-white"
                >
                  <option value="">All Employees</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Year:</span>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                className="app-input px-3 py-1.5 text-xs bg-white"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sick Leave Card */}
          <div className="bg-white/60 backdrop-blur border border-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Sick Leave</p>
                <h4 className="text-2xl font-black text-gray-800 mt-1">8 Days Limit</h4>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${sickLeaveRemaining < 0 ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
                {sickLeaveRemaining < 0 ? 'Exceeded' : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Used</p>
                <p className="text-lg font-black text-gray-700">{sickLeavesUsed} Days</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining</p>
                <p className={`text-lg font-black ${sickLeaveRemaining < 0 ? 'text-red-600' : 'text-teal-600'}`}>
                  {sickLeaveRemaining} Days
                </p>
              </div>
            </div>
          </div>

          {/* Casual Leave Card */}
          <div className="bg-white/60 backdrop-blur border border-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Casual Leave</p>
                <h4 className="text-2xl font-black text-gray-800 mt-1">12 Days Limit</h4>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${casualLeaveRemaining < 0 ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'}`}>
                {casualLeaveRemaining < 0 ? 'Exceeded' : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Used</p>
                <p className="text-lg font-black text-gray-700">{casualLeavesUsed} Days</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining</p>
                <p className={`text-lg font-black ${casualLeaveRemaining < 0 ? 'text-red-600' : 'text-teal-600'}`}>
                  {casualLeaveRemaining} Days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin User Balances Directory */}
      {isAdmin && (
        <div className="app-card p-6 mb-6 animate-fade-in-up relative overflow-hidden bg-white/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-extrabold text-gray-800 text-lg mb-4 tracking-tight relative z-10">Team Leave Directory ({selectedYear})</h3>
          <div className="overflow-x-auto shadow-sm ring-1 ring-gray-100 rounded-xl relative z-10 bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold text-center">Sick Leaves Used</th>
                  <th className="px-6 py-4 font-bold text-center">Sick Leaves Left</th>
                  <th className="px-6 py-4 font-bold text-center">Casual Leaves Used</th>
                  <th className="px-6 py-4 font-bold text-center">Casual Leaves Left</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const details = getMemberLeaveDetails(u._id);
                  return (
                    <tr key={u._id} className={`hover:bg-teal-50/30 transition-colors ${activeUserId === u._id ? 'bg-indigo-50/40' : ''}`}>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-2">
                            {u.name ? u.name.substring(0,2).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="font-bold">{u.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{details.sickUsed} / 8</td>
                      <td className={`px-6 py-4 text-center font-bold ${details.sickRemaining < 0 ? 'text-red-500' : 'text-teal-600'}`}>
                        {details.sickRemaining}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{details.casualUsed} / 12</td>
                      <td className={`px-6 py-4 text-center font-bold ${details.casualRemaining < 0 ? 'text-red-500' : 'text-teal-600'}`}>
                        {details.casualRemaining}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setSelectedUserId(u._id)} 
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Select Employee
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 border-b border-gray-100/80 pb-4 relative z-10">Apply Time Off</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select Date</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Leave Type</label>
              <select value={leaveType} onChange={(e)=>setLeaveType(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                <option value="Casual Leave">Casual Leave (12/year)</option>
                <option value="Sick Leave">Sick Leave (8/year)</option>
                <option value="Weekly Off">Weekly Off / Weak Off (Record Only)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Reason</label>
              <input type="text" placeholder="e.g. Doctor appointment" value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <button onClick={handleSubmitLeave} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 px-6 py-2.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5">Submit Request</button>
          </div>
        </div>
      )}

      <div className="app-card animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="bg-white/40 backdrop-blur-sm p-6 relative z-10 rounded-2xl">
          {filteredLeavesForTable.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CalendarClock className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-extrabold text-xl mb-2">No time off records</h2>
              <p className="text-gray-400 font-medium text-sm">No leave requests match your filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                  <tr>
                    {isAdmin && <th className="px-6 py-4 font-bold">User</th>}
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Type</th>
                    <th className="px-6 py-4 font-bold">Reason</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    {isAdmin && <th className="px-6 py-4 font-bold text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeavesForTable.map((leave) => (
                    <tr key={leave._id} className="hover:bg-teal-50/30 transition-colors group">
                      {isAdmin && (
                        <td className="px-6 py-4 font-bold text-gray-800">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-2">
                              {leave.user?.name ? leave.user.name.substring(0,2).toUpperCase() : '?'}
                            </div>
                            {leave.user?.name || 'Unknown'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-bold text-gray-700">{new Date(leave.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                          leave.type === 'Sick Leave' ? 'bg-red-50 text-red-600 border-red-100' :
                          (leave.type === 'Weekly Off' || leave.type === 'Week Off' || leave.type === 'Weak Off') ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {leave.type || 'Casual Leave'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{leave.reason}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                          leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          leave.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-center">
                          {leave.status === 'PENDING' ? (
                            <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleUpdateStatus(leave._id, 'APPROVED')} className="text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">Approve</button>
                              <button onClick={() => handleUpdateStatus(leave._id, 'REJECTED')} className="text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">Reject</button>
                            </div>
                          ) : (
                            <span className="text-gray-300 font-medium text-xs">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
