import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function AssignWork() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [workPackageName, setWorkPackageName] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const fetchData = async () => {
    try {
      const endpoint = isAdmin ? '/work' : '/work/me';
      const userResPromise = isAdmin ? axios.get('/auth/users') : Promise.resolve({ data: [] });
      const [uRes, pRes, wRes] = await Promise.all([
        userResPromise,
        axios.get('/projects'),
        axios.get(endpoint)
      ]);
      setUsers(uRes.data || []);
      setProjects(pRes.data);
      setAssignments(wRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const handleDelete = async (id) => {
    if(!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/work/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch(err) { toast.error('Failed to delete task'); }
  };


  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', estimatedHours: 0 });
  
  const startEdit = (t) => {
    setEditingId(t._id);
    setEditData({ name: t.name, estimatedHours: t.estimatedHours || 0 });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/work/${id}`, editData);
      toast.success('Task updated');
      setEditingId(null);
      fetchData();
    } catch(err) { toast.error('Failed to update task'); }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedProject || !workPackageName || !estimatedHours) {
      return toast.error('Fill all required fields');
    }
    try {
      await axios.post('/work', {
        user: selectedUser,
        project: selectedProject,
        name: workPackageName,
        estimatedHours: Number(estimatedHours)
      });
      toast.success('Task Assigned Successfully');
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        {isAdmin && (
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-4 py-2 flex items-center text-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="app-card p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Assign New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Assignee</label>
              <select value={selectedUser} onChange={(e)=>setSelectedUser(e.target.value)} className="w-full app-input px-2 py-1.5 text-sm">
                <option value=""></option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project</label>
              <select value={selectedProject} onChange={(e)=>setSelectedProject(e.target.value)} className="w-full app-input px-2 py-1.5 text-sm">
                <option value=""></option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Task Name</label>
              <input type="text" value={workPackageName} onChange={(e)=>setWorkPackageName(e.target.value)} className="w-full app-input px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Est. Hours</label>
              <input type="number" step="0.1" value={estimatedHours} onChange={(e)=>setEstimatedHours(e.target.value)} className="w-full app-input px-2 py-1.5 text-sm" />
            </div>
            <button onClick={handleAssign} className="app-btn-primary px-4 py-1.5 text-sm w-full">Save Task</button>
          </div>
        </div>
      )}

      {/* Apploye Tasks Table layout */}
      <div className="app-card flex-1 overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
           <div className="w-48">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Projects</label>
              <select className="app-input w-full px-2 py-1.5 text-xs"><option>[All Active Projects]</option></select>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Search Task</label>
              <input type="text" placeholder="Search by task name..." className="app-input w-full px-3 py-1.5 text-xs" />
           </div>
           <div className="w-32">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Status</label>
              <select className="app-input w-full px-2 py-1.5 text-xs"><option>To Do</option><option>Completed</option></select>
           </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold">Task Name</th>
                <th className="pb-3 font-semibold">Project</th>
                <th className="pb-3 font-semibold">Assignee</th>
                <th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                 <tr key={a._id} className="border-b border-gray-100 hover:bg-gray-50">
                    
                      <td className="py-3 text-gray-800 font-medium">
                        {editingId === a._id ? <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-2 py-1 text-sm"/> : a.name}
                      </td>
                      <td className="py-3 text-gray-600">{a.project?.name}</td>
                      <td className="py-3 text-gray-600">{a.user?.name}</td>
                      <td className="py-3 text-center">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{a.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        {editingId === a._id ? (
                          <>
                            <button onClick={() => handleUpdate(a._id)} className="text-green-600 font-medium mr-3">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(a)} className="text-teal-600 font-medium mr-3">Edit</button>
                            <button onClick={() => handleDelete(a._id)} className="text-red-500 font-medium">Delete</button>
                          </>
                        )}
                      </td>
                 </tr>
              ))}
              {assignments.length === 0 && (
                 <tr>
                    <td colSpan="4" className="text-center py-20">
                      <p className="text-gray-500 font-medium">No tasks found.</p>
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
