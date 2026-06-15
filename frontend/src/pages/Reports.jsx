import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { FileText, Download, Clock } from 'lucide-react';

export default function Reports() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const endpoint = user?.role === 'Admin' ? '/work' : '/work/me';
        const { data } = await axios.get(endpoint);
        
        let allLogs = [];
        data.forEach(pkg => {
          if (pkg.timeLogs && pkg.timeLogs.length > 0) {
            pkg.timeLogs.forEach(log => {
              allLogs.push({
                ...log,
                workPackageName: pkg.name,
                projectName: pkg.project?.name,
                userName: pkg.user?.name || user?.name || 'Unknown'
              });
            });
          }
        });
        
        // Sort by date descending
        allLogs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setLogs(allLogs);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,User,Project,Task,Duration(hrs),Status\n";
    logs.forEach(row => {
      const date = new Date(row.startTime).toLocaleDateString();
      const duration = (row.duration || 0).toFixed(2);
      const csvRow = `"${date}","${row.userName}","${row.projectName || ''}","${row.workPackageName || ''}","${duration}","${row.status || ''}"`;
      csvContent += csvRow + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "timesheet_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in-up">
        <div className="flex items-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
            <FileText className="w-8 h-8 mr-3 text-teal-500" /> Timesheet Reports
          </h1>
        </div>
        <button onClick={handleDownloadCSV} className="app-btn-primary px-6 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all shadow-lg hover:shadow-teal-500/25">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="flex-1 overflow-auto bg-white/40 backdrop-blur-sm p-6 relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Date & Time</th>
                    {user?.role === 'Admin' && <th className="px-6 py-4 font-bold">User</th>}
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Task</th>
                    <th className="px-6 py-4 font-bold text-center">Duration (hrs)</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, idx) => (
                     <tr key={idx} className="hover:bg-teal-50/30 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                             <Clock className="w-4 h-4 mr-2 text-gray-400 group-hover:text-teal-500 transition-colors" />
                             <span className="font-bold text-gray-800">{new Date(log.startTime).toLocaleDateString()}</span>
                             <span className="ml-2 text-xs font-semibold text-gray-500">{new Date(log.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                        </td>
                        {user?.role === 'Admin' && (
                          <td className="px-6 py-4 font-bold text-gray-800">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-2">
                                {log.userName.substring(0,2).toUpperCase()}
                              </div>
                              {log.userName}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-600 font-semibold">{log.projectName}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{log.workPackageName}</td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-extrabold border border-teal-100">
                             {(log.duration || 0).toFixed(2)}h
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-bold border border-gray-200">
                            {log.status}
                          </span>
                        </td>
                     </tr>
                  ))}
                  {logs.length === 0 && (
                     <tr>
                        <td colSpan={user?.role === 'Admin' ? "6" : "5"} className="text-center py-24">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-bold">No time logs found.</p>
                          </div>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
