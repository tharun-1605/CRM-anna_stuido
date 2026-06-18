import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { exportToCSV } from '../utils/exportUtils';

export default function AssignWork() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [filterProject, setFilterProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [assignToType, setAssignToType] = useState('User');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [workPackageName, setWorkPackageName] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
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
  const [editData, setEditData] = useState({ name: '', estimatedHours: 0, priority: 'Medium', dueDate: '' });
  
  const startEdit = (t) => {
    setEditingId(t._id);
    setEditData({ 
      name: t.name, 
      estimatedHours: t.estimatedHours || 0, 
      priority: t.priority || 'Medium',
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : ''
    });
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
        estimatedHours: Number(estimatedHours),
        priority,
        dueDate
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
      setPriority('Medium');
      setDueDate('');
      fetchData();
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  const handleExport = () => {
    const filteredAssignments = assignments.filter(a => {
      const matchesProject = !filterProject || (a.project?._id === filterProject);
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || a.name?.toLowerCase().includes(term);
      const matchesStatus = filterStatus === 'All' ? true : a.status === filterStatus;
      return matchesProject && matchesSearch && matchesStatus;
    });

    const exportData = filteredAssignments.map(a => ({
      TaskName: a.name,
      Project: a.project?.name || '-',
      Assignee: a.user?.name || 'Unassigned',
      EstimatedHours: a.estimatedHours || 0,
      Priority: a.priority || 'Medium',
      DueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-',
      Status: a.status
    }));
    exportToCSV(exportData, 'Tasks_Export');
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Tasks</h1>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="bg-white/60 backdrop-blur-md border border-white/50 text-gray-700 hover:bg-white/80 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
          {isAdmin && (
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all rounded-xl">
              <Plus className="w-5 h-5 mr-2" /> Add Task
            </button>
          )}
        </div>
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
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Priority</label>
              <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <button onClick={handleAssign} className="app-btn-primary px-6 py-2.5 text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all w-full">Save Task</button>
          </div>
        </div>
      )}

      {/* Apploye Tasks Table layout */}
      {(() => {
        const filteredAssignments = assignments.filter(a => {
          const matchesProject = !filterProject || (a.project?._id === filterProject);
          const term = searchTerm.toLowerCase();
          const matchesSearch = !term || a.name?.toLowerCase().includes(term);
          const matchesStatus = filterStatus === 'All' ? true : a.status === filterStatus;
          return matchesProject && matchesSearch && matchesStatus;
        });

        return (
          <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        {/* Table Header Controls */}
        <div className="border-b border-white/40 bg-white/30 backdrop-blur-md px-6 py-4 flex items-center space-x-6 relative z-10">
           <div className="w-64">
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 pl-1">Projects</label>
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="app-input w-full px-4 py-2 text-sm bg-white/50">
                <option value="">[All Projects]</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 pl-1">Search Task</label>
              <input type="text" placeholder="Search by task name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="app-input w-full px-4 py-2 text-sm bg-white/50" />
           </div>
           <div className="w-48">
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 pl-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="app-input w-full px-4 py-2 text-sm bg-white/50">
                <option value="All">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
           </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-transparent p-6 relative z-10">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-500 bg-white/30 border-b border-white/40 uppercase tracking-widest font-black">
                <tr>
                  <th className="px-6 py-5">Task Name</th>
                  <th className="px-6 py-5">Project</th>
                  <th className="px-6 py-5">Assignee</th>
                  <th className="px-6 py-5">Due Date</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignments.map(a => (
                   <tr key={a._id} className="hover:bg-white/40 transition-colors group">
                      
                        <td className="px-6 py-4 text-gray-800 font-bold">
                          <div className="flex items-center">
                            {editingId === a._id ? (
                              <>
                                <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full mr-2"/>
                                <select value={editData.priority} onChange={e=>setEditData({...editData, priority: e.target.value})} className="app-input px-2 py-1.5 text-xs">
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                              </>
                            ) : (
                              <>
                                {a.name}
                                {a.priority === 'High' && <span className="ml-2 bg-red-100/50 backdrop-blur text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-200">High</span>}
                                {a.priority === 'Medium' && <span className="ml-2 bg-yellow-100/50 backdrop-blur text-yellow-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-yellow-200">Med</span>}
                                {a.priority === 'Low' && <span className="ml-2 bg-green-100/50 backdrop-blur text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-200">Low</span>}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-bold">{a.project?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black text-xs mr-3 shadow-sm group-hover:scale-110 transition-transform">
                              {a.user?.name ? a.user.name.substring(0,2).toUpperCase() : '?'}
                            </div>
                            <span className="font-bold text-gray-800">{a.user?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingId === a._id ? (
                            <input type="date" value={editData.dueDate} onChange={e=>setEditData({...editData, dueDate: e.target.value})} className="app-input px-2 py-1.5 text-xs w-full" />
                          ) : (
                            <span className={`font-semibold ${a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'Completed' ? 'text-red-500' : 'text-gray-600'}`}>
                              {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}
                              {a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'Completed' && (
                                <span className="ml-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`bg-white/60 backdrop-blur text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full font-bold border border-white/60 shadow-sm ${a.status === 'Completed' ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-700'}`}>{a.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === a._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdate(a._id)} className="bg-emerald-100/50 backdrop-blur border border-emerald-200 text-emerald-700 hover:bg-emerald-200/50 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-white/50 backdrop-blur border border-white/60 text-gray-700 hover:bg-white/80 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm">Cancel</button>
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
                {filteredAssignments.length === 0 && (
                   <tr>
                      <td colSpan="6" className="text-center py-24">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-white/50 backdrop-blur-md border border-white/60 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                          </div>
                          <p className="text-gray-500 font-bold tracking-wide">No tasks found.</p>
                        </div>
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ); })()}
    </div>
  );
}
