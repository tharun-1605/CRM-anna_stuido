import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function WorkPackages() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState('All');

  const fetchData = async () => {
    try {
      const endpoint = user?.role === 'Admin' ? '/work' : '/work/me';
      const [wRes, pRes] = await Promise.all([
        axios.get(endpoint),
        axios.get('/projects')
      ]);
      setAssignments(wRes.data);
      setProjects(pRes.data);
    } catch (err) {
      toast.error('Failed to fetch timesheets');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  
  const startEdit = (t) => {
    setEditingId(t._id);
    setEditStatus(t.status);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/work/${id}`, { status: editStatus });
      toast.success('Progress updated');
      setEditingId(null);
      fetchData();
    } catch(err) { toast.error('Failed to update progress'); }
  };

  const filteredAssignments = filterProject === 'All' 
    ? assignments 
    : assignments.filter(a => a.project?._id === filterProject);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">
          {user?.role === 'Admin' ? 'Timesheets' : 'My Tasks'}
        </h1>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        {/* Table Header Controls */}
        <div className="border-b border-gray-100/80 bg-white/50 px-6 py-4 flex items-center space-x-6 relative z-10">
           <div className="w-64">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Filter by Project</label>
              <select value={filterProject} onChange={(e)=>setFilterProject(e.target.value)} className="app-input w-full px-4 py-2 text-sm shadow-sm">
                <option value="All">[All Active Projects]</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
           </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-white/40 backdrop-blur-sm p-6 relative z-10">
          {filteredAssignments.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full py-24">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <h2 className="text-gray-600 font-extrabold text-xl mb-2">No timesheets found</h2>
               <p className="text-gray-400 font-medium text-sm">Assign tasks to see them appear here.</p>
             </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Task / Work Package</th>
                    {user?.role === 'Admin' && <th className="px-6 py-4 font-bold">User</th>}
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold text-center">Estimated (hrs)</th>
                    <th className="px-6 py-4 font-bold text-center">Time Spent (hrs)</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssignments.map((a) => (
                      <tr key={a._id} className="hover:bg-teal-50/30 transition-colors group">
                        
                        <td className="px-6 py-4 text-gray-800 font-bold">{a.name}</td>
                        {user?.role === 'Admin' && (
                          <td className="px-6 py-4 text-gray-600 font-medium">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-2">
                                {a.user?.name ? a.user.name.substring(0,2).toUpperCase() : '?'}
                              </div>
                              <span className="font-bold text-gray-700">{a.user?.name || 'Unknown'}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-600 font-semibold">{a.project?.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-bold border border-gray-200">
                            {a.estimatedHours ? a.estimatedHours.toFixed(1) : '0.0'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg font-extrabold border border-teal-200">
                            {a.timeSpent ? a.timeSpent.toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {editingId === a._id ? (
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="app-input px-3 py-1.5 text-sm font-semibold text-teal-700 border-teal-300 ring-2 ring-teal-100">
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          ) : (
                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${a.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : a.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {a.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === a._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdate(a._id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(a)} className="text-teal-600 hover:text-teal-800 font-bold transition-colors opacity-0 group-hover:opacity-100">Update Progress</button>
                          )}
                        </td>
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
