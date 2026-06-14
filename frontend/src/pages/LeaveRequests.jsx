import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

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
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Time Off Requests' : 'Time Off'}</h1>
      </div>

      {!isAdmin && (
        <div className="app-card p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">Apply Time Off</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Date</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Reason</label>
              <input type="text" value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <button onClick={handleSubmitLeave} className="app-btn-primary px-4 py-2 text-sm">Submit Request</button>
          </div>
        </div>
      )}

      <div className="app-card flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto bg-white p-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                {isAdmin && <th className="pb-3 font-semibold">User</th>}
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Reason</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                {isAdmin && <th className="pb-3 font-semibold text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-20 text-gray-500 font-medium">No time off records found.</td></tr>
              ) : leaves.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                  {isAdmin && <td className="py-3 text-gray-800 font-medium">{leave.user?.name || 'Unknown'}</td>}
                  <td className="py-3 text-gray-600">{new Date(leave.date).toLocaleDateString()}</td>
                  <td className="py-3 text-gray-600">{leave.reason}</td>
                  <td className="py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded border ${
                      leave.status === 'APPROVED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      leave.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 text-center flex justify-center space-x-2">
                      {leave.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleUpdateStatus(leave._id, 'APPROVED')} className="text-teal-600 hover:bg-teal-50 px-2 py-1 rounded text-xs font-medium border border-teal-200">Approve</button>
                          <button onClick={() => handleUpdateStatus(leave._id, 'REJECTED')} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium border border-red-200">Reject</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
