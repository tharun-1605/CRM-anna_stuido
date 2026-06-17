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
    console.log(`Button clicked! Endpoint: ${endpoint}, Payload:`, payload);
    try {
      const res = await handleAction(endpoint, payload);
      console.log(`Action result:`, res);
      if (res.success) {
        toast.success('Action successful');
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error in handleBtnClick:", error);
      alert("Error: " + error.message);
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
      <div className="max-w-3xl mx-auto mt-8 animate-fade-in-up">
        <div className="app-card p-10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-indigo-500"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
          
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
            <UserCheck className="w-12 h-12 text-teal-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-indigo-700 mb-2 relative z-10 tracking-tight">Daily Attendance</h2>
          <p className="text-gray-500 font-medium mb-10 relative z-10">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="grid grid-cols-2 gap-6 w-full mb-10 relative z-10">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-3 text-teal-600">
                <PlayCircle className="w-5 h-5 mr-2 opacity-70" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clock In</p>
              </div>
              <p className="text-3xl font-extrabold text-gray-800">{formatTime(todayRecord?.clockIn)}</p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-3 text-red-500">
                <LogOut className="w-5 h-5 mr-2 opacity-70" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clock Out</p>
              </div>
              <p className="text-3xl font-extrabold text-gray-800">{formatTime(todayRecord?.clockOut)}</p>
            </div>
          </div>

          <div className="mb-10 w-full max-w-sm relative z-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Active Working Time</span>
              <span className="text-2xl font-black text-teal-600">{calculateActiveTime()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden">
              <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full transition-all duration-1000 ease-in-out relative" style={{ width: isClockedIn ? '100%' : (isClockedOut ? '100%' : '0%') }}>
                {isClockedIn && !isOnBreak && (
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full">
                    <div className="w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            {!todayRecord?.clockIn ? (
              <button type="button" onClick={() => handleBtnClick('clock-in')} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 flex items-center px-10 py-4 rounded-xl text-lg font-bold transition-all transform hover:-translate-y-1">
                <PlayCircle className="w-6 h-6 mr-2" /> Clock In
              </button>
            ) : !isClockedOut ? (
              <>
                {!isOnBreak ? (
                  <>
                    <button type="button" onClick={() => handleBtnClick('break/start', { type: 'Break' })} className="bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-yellow-500/30 text-white flex items-center px-6 py-4 rounded-xl text-base font-bold transition-all transform hover:-translate-y-1">
                      <Coffee className="w-5 h-5 mr-2" /> Take Break
                    </button>
                    <button type="button" onClick={() => handleBtnClick('break/start', { type: 'Lunch' })} className="bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-orange-500/30 text-white flex items-center px-6 py-4 rounded-xl text-base font-bold transition-all transform hover:-translate-y-1">
                      <StopCircle className="w-5 h-5 mr-2" /> Take Lunch
                    </button>
                    <button type="button" onClick={() => handleBtnClick('clock-out')} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/30 text-white flex items-center px-8 py-4 rounded-xl text-base font-bold transition-all transform hover:-translate-y-1">
                      <LogOut className="w-5 h-5 mr-2" /> Clock Out
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => handleBtnClick('break/end')} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-teal-500/30 text-white flex items-center px-10 py-4 rounded-xl text-lg font-bold transition-all transform hover:-translate-y-1">
                    <PlayCircle className="w-6 h-6 mr-2" /> Resume Work
                  </button>
                )}
              </>
            ) : (
              <div className="text-emerald-700 font-extrabold flex items-center bg-emerald-50 px-8 py-4 rounded-xl border border-emerald-200 shadow-sm">
                <UserCheck className="w-6 h-6 mr-3" /> Shift Completed for Today
              </div>
            )}
          </div>

          {todayRecord?.breaks?.length > 0 && (
            <div className="mt-10 w-full text-left relative z-10">
              <h4 className="font-extrabold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center"><Clock className="w-4 h-4 mr-2 text-teal-500"/> Today's Breaks</h4>
              <div className="space-y-3">
                {todayRecord.breaks.map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                    <div className="flex items-center">
                       <div className={`w-2 h-2 rounded-full mr-3 ${b.type === 'Lunch' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                       <span className="font-bold text-gray-800">{b.type}</span>
                    </div>
                    <span className="font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-md">{formatTime(b.startTime)} - {formatTime(b.endTime)}</span>
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
      <div className="flex flex-col h-full space-y-6 py-4">
        <div className="flex items-center justify-between mb-2 animate-fade-in-up">
          <div className="flex items-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
              <UserCheck className="w-8 h-8 mr-3 text-teal-500" /> Employee Attendance
            </h1>
          </div>
          <div>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
              className="app-input shadow-sm font-medium px-4 py-2"
            />
          </div>
        </div>

        <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
          
          <div className="flex-1 overflow-auto bg-white/40 backdrop-blur-sm p-6 relative z-10">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold text-center">Clock In</th>
                    <th className="px-6 py-4 font-bold text-center">Clock Out</th>
                    <th className="px-6 py-4 font-bold text-center">Active Hours</th>
                    <th className="px-6 py-4 font-bold text-center">Breaks</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminRecords.map((r) => (
                     <tr key={r._id} className="hover:bg-teal-50/30 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                           <div className="flex items-center">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-2">
                               {r.user?.name ? r.user.name.substring(0,2).toUpperCase() : '?'}
                             </div>
                             {r.user?.name}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-teal-600">{formatTime(r.clockIn)}</td>
                        <td className="px-6 py-4 text-center font-extrabold text-red-500">{formatTime(r.clockOut)}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-extrabold border border-gray-200">
                             {(r.totalHours || 0).toFixed(2)}h
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-500">
                           {r.breaks?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200">{r.status}</span>
                        </td>
                     </tr>
                  ))}
                  {adminRecords.length === 0 && (
                     <tr>
                        <td colSpan="7" className="text-center py-24">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <UserCheck className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-bold">No attendance records found for this date.</p>
                          </div>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (storeLoading && !todayRecord && adminRecords.length === 0) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto h-full w-full">
      {user?.role === 'Admin' ? renderAdminView() : renderUserView()}
    </div>
  );
}
