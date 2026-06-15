import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { UserCheck, Clock, Coffee, StopCircle, PlayCircle, LogOut } from 'lucide-react';

import useAttendanceStore from '../store/attendanceStore';

export default function Attendance() {
  const { user } = useAuthStore();
  const { todayRecord, loading: storeLoading, fetchToday, handleAction } = useAttendanceStore();
  const [adminRecords, setAdminRecords] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const fetchAdminRecords = async () => {
    try {
      setLoadingAdmin(true);
      const params = dateFilter ? { date: dateFilter } : {};
      const { data } = await axios.get('/attendance', { params });
      setAdminRecords(data);
    } catch (err) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAdminRecords();
    } else {
      fetchToday();
    }
  }, [user, dateFilter]);

  const handleBtnClick = async (endpoint, payload = {}) => {
    const res = await handleAction(endpoint, payload);
    if (res.success) {
      toast.success('Action successful');
    } else {
      toast.error(res.message);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDurationString = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateActiveTime = () => {
    if (!todayRecord || !todayRecord.clockIn) return '0h 0m';
    const end = todayRecord.clockOut ? new Date(todayRecord.clockOut) : new Date();
    let totalMs = end.getTime() - new Date(todayRecord.clockIn).getTime();
    
    todayRecord.breaks?.forEach(b => {
      const bEnd = b.endTime ? new Date(b.endTime) : new Date();
      if (b.startTime) {
        totalMs -= (bEnd.getTime() - new Date(b.startTime).getTime());
      }
    });
    
    return getDurationString(totalMs);
  };

  const renderUserView = () => {
    const isClockedIn = !!todayRecord?.clockIn && !todayRecord?.clockOut;
    const isClockedOut = !!todayRecord?.clockOut;
    const activeBreak = todayRecord?.breaks?.find(b => !b.endTime);
    const isOnBreak = !!activeBreak;

    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="app-card p-8 flex flex-col items-center text-center">
          <UserCheck className="w-16 h-16 text-teal-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Daily Attendance</h2>
          <p className="text-gray-500 mb-8">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="grid grid-cols-2 gap-8 w-full mb-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Clock In</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(todayRecord?.clockIn)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Clock Out</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(todayRecord?.clockOut)}</p>
            </div>
          </div>

          <div className="mb-8 w-full max-w-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 font-medium">Active Working Time</span>
              <span className="font-bold text-teal-600">{calculateActiveTime()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: isClockedIn ? '100%' : (isClockedOut ? '100%' : '0%') }}></div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {!todayRecord?.clockIn ? (
              <button onClick={() => handleBtnClick('clock-in')} disabled={storeLoading} className="app-btn-primary flex items-center px-8 py-3 text-lg">
                <PlayCircle className="w-6 h-6 mr-2" /> Clock In
              </button>
            ) : !isClockedOut ? (
              <>
                {!isOnBreak ? (
                  <>
                    <button onClick={() => handleBtnClick('break/start', { type: 'Break' })} disabled={storeLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center px-6 py-3 rounded text-lg font-medium transition-colors">
                      <Coffee className="w-6 h-6 mr-2" /> Take Break
                    </button>
                    <button onClick={() => handleBtnClick('break/start', { type: 'Lunch' })} disabled={storeLoading} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center px-6 py-3 rounded text-lg font-medium transition-colors">
                      <StopCircle className="w-6 h-6 mr-2" /> Take Lunch
                    </button>
                    <button onClick={() => handleBtnClick('clock-out')} disabled={storeLoading} className="bg-red-500 hover:bg-red-600 text-white flex items-center px-8 py-3 rounded text-lg font-medium transition-colors">
                      <LogOut className="w-6 h-6 mr-2" /> Clock Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleBtnClick('break/end')} disabled={storeLoading} className="app-btn-primary flex items-center px-8 py-3 text-lg">
                    <PlayCircle className="w-6 h-6 mr-2" /> Resume Work
                  </button>
                )}
              </>
            ) : (
              <div className="text-green-600 font-bold flex items-center bg-green-50 px-6 py-3 rounded-lg border border-green-200">
                <UserCheck className="w-6 h-6 mr-2" /> Shift Completed for Today
              </div>
            )}
          </div>

          {todayRecord?.breaks?.length > 0 && (
            <div className="mt-8 w-full text-left">
              <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4">Today's Breaks</h4>
              <div className="space-y-3">
                {todayRecord.breaks.map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">{b.type}</span>
                    <span className="text-gray-500">{formatTime(b.startTime)} - {formatTime(b.endTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-teal-600">
            <UserCheck className="w-6 h-6 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Employee Attendance</h1>
          </div>
          <div>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
              className="app-input"
            />
          </div>
        </div>

        <div className="app-card flex-1 overflow-auto bg-white p-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold text-center">Clock In</th>
                <th className="pb-3 font-semibold text-center">Clock Out</th>
                <th className="pb-3 font-semibold text-center">Active Hours</th>
                <th className="pb-3 font-semibold text-center">Breaks Taken</th>
                <th className="pb-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminRecords.map((r) => (
                 <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 font-medium text-gray-800">{r.user?.name}</td>
                    <td className="py-3 text-center font-medium text-teal-600">{formatTime(r.clockIn)}</td>
                    <td className="py-3 text-center font-medium text-red-500">{formatTime(r.clockOut)}</td>
                    <td className="py-3 text-center font-semibold text-gray-700">{(r.totalHours || 0).toFixed(2)}h</td>
                    <td className="py-3 text-center text-gray-500">{r.breaks?.length || 0}</td>
                    <td className="py-3 text-center">
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded border border-green-200 font-medium">{r.status}</span>
                    </td>
                 </tr>
              ))}
              {adminRecords.length === 0 && (
                 <tr>
                    <td colSpan="7" className="text-center py-20 text-gray-500 font-medium">
                      No attendance records found for this date.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (storeLoading && !todayRecord && adminRecords.length === 0) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto h-full w-full">
      {user?.role === 'Admin' ? renderAdminView() : renderUserView()}
    </div>
  );
}
