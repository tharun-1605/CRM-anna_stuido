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
  const [assignToType, setAssignToType] = useState('User');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [workPackageName, setWorkPackageName] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [teams, setTeams] = useState([]);

  const fetchData = async () => {
    try {
      const endpoint = isAdmin ? '/work' : '/work/me';
      const userResPromise = isAdmin ? axios.get('/auth/users') : Promise.resolve({ data: [] });
      const [uRes, pRes, wRes, tRes] = await Promise.all([
        userResPromise,
        axios.get('/projects'),
        axios.get(endpoint),
        isAdmin ? axios.get('/teams') : Promise.resolve({ data: [] })
      ]);
      setUsers(uRes.data || []);
      setProjects(pRes.data);
      setAssignments(wRes.data);
      setTeams(tRes.data || []);
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
    if ((assignToType === 'User' && !selectedUser) || (assignToType === 'Team' && !selectedTeam) || !selectedProject || !workPackageName || !estimatedHours) {
      return toast.error('Fill all required fields');
    }
    try {
      const payload = {
        project: selectedProject,
        name: workPackageName,
        estimatedHours: Number(estimatedHours)
      };
      
      if (assignToType === 'User') {
        payload.user = selectedUser;
      } else {
        payload.team = selectedTeam;
      }

      await axios.post('/work', payload);
      toast.success('Task Assigned Successfully');
      setIsFormOpen(false);
      setWorkPackageName('');
      setEstimatedHours('');
      fetchData();
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Tasks</h1>
        {isAdmin && (
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all">
            <Plus className="w-5 h-5 mr-2" /> Add Task
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 relative z-10">Assign New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-end relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Assign To</label>
              <select value={assignToType} onChange={(e)=>setAssignToType(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm font-bold text-teal-700">
                <option value="User">Single User</option>
                <option value="Team">Entire Team</option>
              </select>
            </div>
            
            {assignToType === 'User' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select User</label>
                <select value={selectedUser} onChange={(e)=>setSelectedUser(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select Team</label>
                <select value={selectedTeam} onChange={(e)=>setSelectedTeam(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                  <option value="">Select Team</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Project</label>
              <select value={selectedProject} onChange={(e)=>setSelectedProject(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                <option value="">Select Project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Task Name</label>
              <input type="text" placeholder="e.g. Design Homepage" value={workPackageName} onChange={(e)=>setWorkPackageName(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Est. Hours</label>
              <input type="number" step="0.1" placeholder="0.0" value={estimatedHours} onChange={(e)=>setEstimatedHours(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <button onClick={handleAssign} className="app-btn-primary px-6 py-2.5 text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all w-full">Save Task</button>
          </div>
        </div>
      )}

      {/* Apploye Tasks Table layout */}
      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        {/* Table Header Controls */}
        <div className="border-b border-gray-100/80 bg-white/50 px-6 py-4 flex items-center space-x-6 relative z-10">
           <div className="w-64">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Projects</label>
              <select className="app-input w-full px-3 py-2 text-sm"><option>[All Active Projects]</option></select>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Search Task</label>
              <input type="text" placeholder="Search by task name..." className="app-input w-full px-4 py-2 text-sm" />
           </div>
           <div className="w-48">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Status</label>
              <select className="app-input w-full px-3 py-2 text-sm"><option>To Do</option><option>Completed</option></select>
           </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-white/40 backdrop-blur-sm p-6 relative z-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Task Name</th>
                  <th className="px-6 py-4 font-bold">Project</th>
                  <th className="px-6 py-4 font-bold">Assignee</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map(a => (
                   <tr key={a._id} className="hover:bg-teal-50/30 transition-colors group">
                      
                        <td className="px-6 py-4 text-gray-800 font-bold">
                          {editingId === a._id ? <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/> : a.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-semibold">{a.project?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-2">
                              {a.user?.name ? a.user.name.substring(0,2).toUpperCase() : '?'}
                            </div>
                            <span className="font-bold text-gray-700">{a.user?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-bold border border-gray-200">{a.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === a._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdate(a._id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(a)} className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Edit</button>
                              <button onClick={() => handleDelete(a._id)} className="text-red-500 hover:text-red-700 font-bold transition-colors">Delete</button>
                            </div>
                          )}
                        </td>
                   </tr>
                ))}
                {assignments.length === 0 && (
                   <tr>
                      <td colSpan="5" className="text-center py-24">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                          </div>
                          <p className="text-gray-500 font-bold">No tasks found.</p>
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
}
