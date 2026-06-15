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
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{user?.role === 'Admin' ? 'Timesheets' : 'My Tasks'}</h1>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
           <div className="w-64">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Filter by Project</label>
              <select value={filterProject} onChange={(e)=>setFilterProject(e.target.value)} className="app-input w-full px-2 py-1.5 text-xs">
                <option value="All">[All Active Projects]</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
           </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold">Task / Work Package</th>
                {user?.role === 'Admin' && <th className="pb-3 font-semibold">User</th>}
                <th className="pb-3 font-semibold">Project</th>
                <th className="pb-3 font-semibold text-center">Estimated (hrs)</th>
                <th className="pb-3 font-semibold text-center">Time Spent (hrs)</th>
                <th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a) => (
                  <tr key={a._id} className="border-b border-gray-100 hover:bg-gray-50">
                    
                    <td className="py-3 text-gray-800 font-medium">{a.name}</td>
                    {user?.role === 'Admin' && <td className="py-3 text-gray-600 font-medium">{a.user?.name || 'Unknown'}</td>}
                    <td className="py-3 text-gray-600">{a.project?.name}</td>
                    <td className="py-3 text-center text-gray-600">{a.estimatedHours.toFixed(1)}</td>
                    <td className="py-3 text-center font-semibold text-teal-600">{a.timeSpent.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      {editingId === a._id ? (
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="app-input px-2 py-1 text-sm">
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{a.status}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {editingId === a._id ? (
                        <>
                          <button onClick={() => handleUpdate(a._id)} className="text-green-600 font-medium mr-3">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(a)} className="text-teal-600 font-medium">Update Progress</button>
                      )}
                    </td>
                 </tr>
              ))}
              {filteredAssignments.length === 0 && (
                 <tr>
                    <td colSpan={user?.role === 'Admin' ? "6" : "5"} className="text-center py-20">
                      <p className="text-gray-500 font-medium">No timesheets found.</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
