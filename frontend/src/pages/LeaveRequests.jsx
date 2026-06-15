import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Calendar, CalendarClock } from 'lucide-react';

export default function LeaveRequests() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  
  const [leaves, setLeaves] = useState([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const endpoint = isAdmin ? '/leaves' : '/leaves/me';
      const { data } = await axios.get(endpoint);
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin]);

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
      await axios.post('/leaves', { date, reason });
      toast.success('Time off applied successfully');
      setDate('');
      setReason('');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to apply time off');
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-teal-500" />
          {isAdmin ? 'Time Off Requests' : 'Time Off'}
        </h1>
      </div>

      {!isAdmin && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 border-b border-gray-100/80 pb-4 relative z-10">Apply Time Off</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select Date</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Reason</label>
              <input type="text" placeholder="e.g. Doctor appointment" value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <button onClick={handleSubmitLeave} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 px-6 py-2.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5">Submit Request</button>
          </div>
        </div>
      )}

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="flex-1 overflow-auto bg-white/40 backdrop-blur-sm p-6 relative z-10">
          {leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CalendarClock className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-extrabold text-xl mb-2">No time off records</h2>
              <p className="text-gray-400 font-medium text-sm">You haven't requested any time off yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                  <tr>
                    {isAdmin && <th className="px-6 py-4 font-bold">User</th>}
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Reason</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    {isAdmin && <th className="px-6 py-4 font-bold text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaves.map((leave) => (
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
