import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { exportToCSV } from '../utils/exportUtils';
import { Download } from 'lucide-react';

export default function Projects() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewProject, setViewProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', client: '', description: '', startDate: '', endDate: '', priority: 'Medium', events: []
  });

  const addEvent = () => {
    setFormData({
      ...formData,
      events: [...formData.events, { date: '', startTime: '', endTime: '', eventType: '', service: '', location: '', cameraMan: '', hdd: '', copiedBy: '', notes: '' }]
    });
  };

  const handleEventChange = (index, field, value) => {
    const newEvents = [...formData.events];
    newEvents[index][field] = value;
    setFormData({ ...formData, events: newEvents });
  };

  const removeEvent = (index) => {
    const newEvents = formData.events.filter((_, i) => i !== index);
    setFormData({ ...formData, events: newEvents });
  };

  const fetchData = async () => {
    try {
      const endpoint = isAdmin ? '/work' : '/work/me';
      const [pRes, aRes, cRes, uRes] = await Promise.all([
        axios.get('/projects'),
        axios.get(endpoint),
        isAdmin ? axios.get('/clients') : Promise.resolve({ data: [] }),
        isAdmin ? axios.get('/auth/users') : Promise.resolve({ data: [] })
      ]);
      setProjects(pRes.data);
      setAssignments(aRes.data);
      setClients(cRes.data);
      setUsers(uRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const handleDelete = async (id) => {
    if(!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchData();
    } catch(err) { toast.error('Failed to delete project'); }
  };


  const [editingId, setEditingId] = useState(null);
  
  const startEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      name: p.name,
      client: p.client?._id || p.customer || '',
      description: p.description || '',
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : '',
      priority: p.priority || 'Medium',
      events: p.events || []
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error('Project Name is required');
    try {
      if (editingId) {
        await axios.put(`/projects/${editingId}`, formData);
        toast.success('Project updated successfully');
      } else {
        await axios.post('/projects', formData);
        toast.success('Project created successfully');
      }
      fetchData();
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: '', client: '', description: '', startDate: '', endDate: '', priority: 'Medium', events: [] });
    } catch (err) {
      toast.error('Error saving project');
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', client: '', description: '', startDate: '', endDate: '', priority: 'Medium', events: [] });
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = () => {
    const filteredProjects = projects.filter(p => {
      const matchesStatus = statusFilter === 'All' ? true : (statusFilter === 'Active' ? p.status !== 'Completed' : p.status === 'Completed');
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || p.name?.toLowerCase().includes(term) || p._id?.toLowerCase().includes(term) || p.client?.name?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });

    const exportData = filteredProjects.map(p => ({
      ProjectCode: `#${p._id.substring(p._id.length - 6).toUpperCase()}`,
      ProjectName: p.name,
      Client: p.client?.name || p.customer || '-',
      StartDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : '-',
      EndDate: p.endDate ? new Date(p.endDate).toLocaleDateString() : '-',
      Priority: p.priority || 'Medium',
      Status: p.status || 'Pending'
    }));
    exportToCSV(exportData, 'Projects_Export');
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Projects</h1>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="bg-white/60 backdrop-blur-md border border-white/50 text-gray-700 hover:bg-white/80 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
          {isAdmin && (
            <button onClick={() => { if(isFormOpen) handleCancelForm(); else setIsFormOpen(true); }} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all rounded-xl">
              <Plus className="w-5 h-5 mr-2" /> {isFormOpen ? 'Close Form' : 'Create Project'}
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-6xl max-h-[90vh] flex flex-col border border-white/60 overflow-hidden">
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/40 shrink-0">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{editingId ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={handleCancelForm} className="text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white/80 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Project Name</label>
              <input type="text" placeholder="Project Name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Client</label>
              <select value={formData.client} onChange={(e)=>setFormData({...formData, client: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Start Date</label>
              <input type="date" placeholder="Start Date" value={formData.startDate} onChange={(e)=>setFormData({...formData, startDate: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">End Date</label>
              <input type="date" placeholder="End Date" value={formData.endDate} onChange={(e)=>setFormData({...formData, endDate: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Priority</label>
              <select value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm" rows="1"></textarea>
            </div>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className="flex items-center justify-between mb-4 bg-white/40 backdrop-blur p-3 rounded-2xl border border-white/50">
                <h4 className="font-bold text-gray-700 text-sm pl-2">Events Details</h4>
                <button onClick={addEvent} className="bg-gradient-to-r from-teal-400 to-teal-500 text-white hover:opacity-90 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">+ Add Event</button>
            </div>
            <div className="space-y-4">
            {formData.events.map((ev, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 p-5 bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                   <button onClick={() => removeEvent(i)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm opacity-0 group-hover:opacity-100">&times;</button>
                   <div className="col-span-2 md:col-span-1">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                     <input type="date" value={ev.date} onChange={(e)=>handleEventChange(i, 'date', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                     <input type="time" value={ev.startTime} onChange={(e)=>handleEventChange(i, 'startTime', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                     <input type="time" value={ev.endTime} onChange={(e)=>handleEventChange(i, 'endTime', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div className="col-span-2 md:col-span-2">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Event Type</label>
                     <input type="text" placeholder="e.g. Wedding" value={ev.eventType} onChange={(e)=>handleEventChange(i, 'eventType', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Service</label>
                     <input type="text" placeholder="Service" value={ev.service} onChange={(e)=>handleEventChange(i, 'service', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                     <input type="text" placeholder="Location" value={ev.location} onChange={(e)=>handleEventChange(i, 'location', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Camera Man</label>
                     <select value={ev.cameraMan} onChange={(e)=>handleEventChange(i, 'cameraMan', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs">
                        <option value="">Select Member</option>
                        {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">HDD</label>
                     <input type="text" placeholder="HDD" value={ev.hdd} onChange={(e)=>handleEventChange(i, 'hdd', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Copied By</label>
                     <select value={ev.copiedBy} onChange={(e)=>handleEventChange(i, 'copiedBy', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs">
                        <option value="">Select Member</option>
                        {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
                     </select>
                   </div>
                   <div className="col-span-2 md:col-span-5">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                     <input type="text" placeholder="Notes" value={ev.notes} onChange={(e)=>handleEventChange(i, 'notes', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                </div>
            ))}
            </div>
          </div>

          <div className="flex justify-end relative z-10 space-x-3 mt-4 border-t border-white/40 pt-6">
            <button onClick={handleCancelForm} className="bg-white/50 backdrop-blur text-gray-700 hover:bg-white/80 border border-white/60 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">Cancel</button>
            <button onClick={handleSave} className="app-btn-primary px-6 py-2.5 text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all rounded-xl">{editingId ? 'Update Project' : 'Save Project'}</button>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Apploye Projects Table layout */}
      {(() => {
        const filteredProjects = projects.filter(p => {
          const matchesStatus = statusFilter === 'All' ? true : (statusFilter === 'Active' ? p.status !== 'Completed' : p.status === 'Completed');
          const term = searchTerm.toLowerCase();
          const matchesSearch = !term || p.name?.toLowerCase().includes(term) || p._id?.toLowerCase().includes(term) || p.client?.name?.toLowerCase().includes(term);
          return matchesStatus && matchesSearch;
        });

        return (
          <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 z-10"></div>
            {/* Table Header Controls */}
            <div className="border-b border-white/40 bg-white/30 backdrop-blur-md px-6 py-4 flex items-center space-x-4 relative z-10">
               <div className="flex bg-white/40 backdrop-blur rounded-xl p-1.5 shadow-inner border border-white/50">
                <button onClick={() => setStatusFilter('Active')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${statusFilter === 'Active' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Active</button>
                <button onClick={() => setStatusFilter('Archived')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${statusFilter === 'Archived' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Archived</button>
              </div>
              <div className="flex-1">
                 <input type="text" placeholder="Search project by name & code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="app-input w-full max-w-md px-4 py-2 text-sm" />
              </div>
            </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-transparent relative z-10">
           {filteredProjects.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full py-12">
               <div className="w-20 h-20 bg-white/50 backdrop-blur-md border border-white/60 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                 <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <p className="text-gray-500 font-bold tracking-wide">No projects found.</p>
             </div>
           ) : (
             <div className="p-6 space-y-4">
               {filteredProjects.map(p => (
                 <div key={p._id} className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500 overflow-hidden group">
                   <div className="px-6 py-5 flex items-center cursor-pointer hover:bg-white/50 transition-colors" onClick={() => toggleRow(p._id)}>
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black text-lg mr-5 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                       {p.name ? p.name.substring(0,2).toUpperCase() : 'PR'}
                     </div>
                     <div className="w-1/4">
                       <p className="font-extrabold text-gray-800 text-[15px] group-hover:text-indigo-600 transition-colors flex items-center">
                         {p.name}
                         {p.priority === 'High' && <span className="ml-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">High</span>}
                         {p.priority === 'Medium' && <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Med</span>}
                         {p.priority === 'Low' && <span className="ml-2 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Low</span>}
                       </p>
                       <p className="text-xs font-semibold text-gray-400 mt-0.5">Project Code: #{p._id.substring(p._id.length - 6).toUpperCase()}</p>
                     </div>
                     <div className="w-1/4">
                       <p className="text-xs font-semibold text-gray-400 mb-0.5">Client</p>
                       <p className="text-sm font-bold text-gray-700">{p.client?.name || p.customer || '-'}</p>
                     </div>
                     <div className="w-1/4">
                        <p className="text-xs font-semibold text-gray-400 mb-0.5">Timeline</p>
                        <p className="text-sm font-bold text-gray-700 mb-0.5 flex items-center">
                          <span className="text-gray-400 mr-1.5 text-xs">Start:</span> {p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}
                        </p>
                        <p className={`text-sm font-bold flex items-center ${p.endDate && new Date(p.endDate) < new Date() && p.status !== 'Completed' ? 'text-red-500' : 'text-gray-700'}`}>
                          <span className="text-gray-400 mr-1.5 text-xs">End:</span> {p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}
                          {p.endDate && new Date(p.endDate) < new Date() && p.status !== 'Completed' && (
                             <span className="ml-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>
                          )}
                        </p>
                     </div>
                     <div className="w-1/4 flex justify-end items-center space-x-4">
                       <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : p.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{p.status || 'Pending'}</span>
                       <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                         {isAdmin && (
                           <>
                             <button onClick={() => startEdit(p)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">Edit</button>
                             <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors">Delete</button>
                           </>
                         )}
                         <button onClick={(e) => { e.stopPropagation(); setViewProject(p); }} className="text-teal-600 hover:text-teal-800 font-bold text-sm transition-colors flex items-center"><Eye className="w-4 h-4 mr-1"/> View</button>
                       </div>
                     </div>
                   </div>
                   
                   {/* Expanded Area matching screenshot cards */}
                   {expandedRows.has(p._id) && (
                     <div className="px-6 pb-6 pt-3 border-t border-white/40 bg-white/20">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                         <div className="bg-white/50 backdrop-blur border border-white/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-hover/card:text-indigo-600 transition-colors">Total Budget</p>
                           <p className="text-sm font-black text-teal-700 bg-teal-100/50 backdrop-blur px-3 py-1 rounded-full border border-teal-200">Budget not set</p>
                         </div>
                         <div className="bg-white/50 backdrop-blur border border-white/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-hover/card:text-indigo-600 transition-colors">Spent Amount</p>
                           <p className="text-sm font-black text-teal-700 bg-teal-100/50 backdrop-blur px-3 py-1 rounded-full border border-teal-200">Budget not set</p>
                         </div>
                         <div className="bg-white/50 backdrop-blur border border-white/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-hover/card:text-indigo-600 transition-colors">Spent Hours</p>
                           <p className="text-sm font-black text-gray-600 bg-gray-100/50 backdrop-blur px-3 py-1 rounded-full border border-gray-200">Time not tracked yet</p>
                         </div>
                         <div className="bg-white/50 backdrop-blur border border-white/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-hover/card:text-indigo-600 transition-colors">Billable Amount</p>
                           <p className="text-sm font-black text-gray-600 bg-gray-100/50 backdrop-blur px-3 py-1 rounded-full border border-gray-200">Billing not set</p>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
      ); })()}

      {/* Project Details Modal */}
      {viewProject && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-white/60">
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/40">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{viewProject.name} <span className="text-gray-400 font-bold ml-2 text-lg">Details</span></h2>
              <button onClick={() => setViewProject(null)} className="text-gray-500 hover:text-gray-900 bg-white/50 hover:bg-white/80 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm">&times;</button>
            </div>
            <div className="p-6 overflow-auto flex-1 custom-scrollbar">
               <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-gradient-to-br from-indigo-50/60 to-purple-50/60 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm">
                  <div><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Client</span> <strong className="text-gray-800 text-base">{viewProject.client?.name || viewProject.customer || '-'}</strong></div>
                  <div><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Start Date</span> <strong className="text-gray-800 text-base">{viewProject.startDate ? new Date(viewProject.startDate).toLocaleDateString() : '-'}</strong></div>
                  <div><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">End Date</span> <strong className="text-gray-800 text-base">{viewProject.endDate ? new Date(viewProject.endDate).toLocaleDateString() : '-'}</strong></div>
                  <div className="col-span-2 md:col-span-4"><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Description</span> <strong className="text-gray-800 font-medium">{viewProject.description || '-'}</strong></div>
               </div>
               
               <h3 className="font-extrabold text-gray-800 mb-4 text-lg">Events</h3>
               {viewProject.events && viewProject.events.length > 0 ? (
                 <div className="overflow-x-auto shadow-sm ring-1 ring-gray-100 rounded-xl">
                   <table className="min-w-full text-sm divide-y divide-gray-100">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Date</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Start</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">End</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Event Type</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Service</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Location</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Camera Man</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">HDD</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Copied By</th>
                         <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Notes</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 bg-white">
                       {viewProject.events.map((ev, i) => (
                         <tr key={i} className="hover:bg-teal-50/50 transition-colors">
                           <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-800">{ev.date ? new Date(ev.date).toLocaleDateString() : '-'}</td>
                           <td className="py-3 px-4 whitespace-nowrap text-gray-600 font-medium">{ev.startTime || '-'}</td>
                           <td className="py-3 px-4 whitespace-nowrap text-gray-600 font-medium">{ev.endTime || '-'}</td>
                           <td className="py-3 px-4 text-gray-600 font-medium"><span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold">{ev.eventType || '-'}</span></td>
                           <td className="py-3 px-4 text-gray-600 font-medium">{ev.service || '-'}</td>
                           <td className="py-3 px-4 text-gray-600 font-medium">{ev.location || '-'}</td>
                           <td className="py-3 px-4 text-gray-600 font-medium">{ev.cameraMan || '-'}</td>
                           <td className="py-3 px-4 text-gray-600 font-medium">{ev.hdd || '-'}</td>
                           <td className="py-3 px-4 text-gray-600 font-medium">{ev.copiedBy || '-'}</td>
                           <td className="py-3 px-4 text-gray-600 font-medium">{ev.notes || '-'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <p className="text-sm text-gray-500 font-medium bg-gray-50 p-6 rounded-xl text-center border border-gray-100 border-dashed">No events added for this project.</p>
               )}

               <h3 className="font-black text-gray-800 mb-5 text-xl mt-8">Tasks Assigned</h3>
               {(() => {
                 const projectTasks = assignments.filter(a => a.project?._id === viewProject._id);
                 if (projectTasks.length === 0) {
                   return <p className="text-sm text-gray-500 font-bold bg-white/40 backdrop-blur p-6 rounded-2xl text-center border border-white/60">No tasks assigned to this project yet.</p>;
                 }
                 return (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                     {projectTasks.map(task => (
                       <div key={task._id} className="bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500">
                         <div className="flex justify-between items-start mb-4">
                           <h4 className="font-black text-gray-800 text-[15px] truncate pr-2 tracking-tight" title={task.name}>{task.name}</h4>
                           <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border shrink-0 backdrop-blur-sm ${task.status === 'Completed' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : task.status === 'In Progress' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 'bg-gray-100/50 text-gray-700 border-gray-200'}`}>{task.status}</span>
                         </div>
                         <div className="text-xs text-gray-600 space-y-2.5 bg-white/40 backdrop-blur p-3.5 rounded-xl border border-white/50">
                           <p className="flex justify-between items-center"><span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Assignee</span> <span className="font-bold text-gray-800">{task.user?.name || 'Unassigned'}</span></p>
                           <p className="flex justify-between items-center"><span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Est. Hours</span> <span className="font-bold text-gray-800 bg-white/60 backdrop-blur px-2 py-0.5 rounded-lg border border-white/60">{task.estimatedHours || 0}h</span></p>
                           <p className="flex justify-between items-center"><span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Due Date</span> <span className={`font-bold ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-600' : 'text-gray-800'}`}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</span></p>
                           <p className="flex justify-between items-center"><span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Priority</span> 
                             <span className={`font-black ${task.priority === 'High' ? 'text-red-600' : task.priority === 'Medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                               {task.priority || 'Medium'}
                             </span>
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 );
               })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
