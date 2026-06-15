import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { FileText, Download } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-teal-600">
          <FileText className="w-6 h-6 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Timesheet Reports</h1>
        </div>
        <button onClick={handleDownloadCSV} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm flex items-center transition-colors">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto bg-white p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="pb-3 font-semibold">Date</th>
                  {user?.role === 'Admin' && <th className="pb-3 font-semibold">User</th>}
                  <th className="pb-3 font-semibold">Project</th>
                  <th className="pb-3 font-semibold">Task</th>
                  <th className="pb-3 font-semibold text-center">Duration (hrs)</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                   <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{new Date(log.startTime).toLocaleDateString()} {new Date(log.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      {user?.role === 'Admin' && <td className="py-3 font-medium text-gray-800">{log.userName}</td>}
                      <td className="py-3 text-gray-600">{log.projectName}</td>
                      <td className="py-3 text-gray-600">{log.workPackageName}</td>
                      <td className="py-3 text-center font-semibold text-teal-600">{(log.duration || 0).toFixed(2)}</td>
                      <td className="py-3">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{log.status}</span>
                      </td>
                   </tr>
                ))}
                {logs.length === 0 && (
                   <tr>
                      <td colSpan={user?.role === 'Admin' ? "6" : "5"} className="text-center py-20">
                        <p className="text-gray-500 font-medium">No time logs found.</p>
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
