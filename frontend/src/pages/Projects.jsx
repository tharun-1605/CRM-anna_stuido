import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Projects() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewProject, setViewProject] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', client: '', description: '', startDate: '', endDate: '', events: []
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

  const fetchData = async () => {
    try {
      const endpoint = isAdmin ? '/work' : '/work/me';
      const [pRes, aRes, cRes] = await Promise.all([
        axios.get('/projects'),
        axios.get(endpoint),
        isAdmin ? axios.get('/clients') : Promise.resolve({ data: [] })
      ]);
      setProjects(pRes.data);
      setAssignments(aRes.data);
      setClients(cRes.data);
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
  const [editData, setEditData] = useState({ name: '', description: '' });
  
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditData({ name: p.name, description: p.description || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/projects/${id}`, editData);
      toast.success('Project updated');
      setEditingId(null);
      fetchData();
    } catch(err) { toast.error('Failed to update project'); }
  };

  const handleCreate = async () => {
    if (!formData.name) return toast.error('Project Name is required');
    try {
      await axios.post('/projects', formData);
      toast.success('Project created successfully');
      fetchData();
      setIsFormOpen(false);
      setFormData({ name: '', client: '', description: '', startDate: '', endDate: '', events: [] });
    } catch (err) {
      toast.error('Error creating project');
    }
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Projects</h1>
        {isAdmin && (
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all">
            <Plus className="w-5 h-5 mr-2" /> Create Project
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 relative z-10">New Project</h3>
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="app-input w-full px-4 py-2.5 text-sm" rows="1"></textarea>
            </div>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className="flex items-center justify-between mb-4 bg-gray-50/80 p-3 rounded-lg border border-gray-100/80">
                <h4 className="font-bold text-gray-700 text-sm">Events Details</h4>
                <button onClick={addEvent} className="bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">+ Add Event</button>
            </div>
            <div className="space-y-3">
            {formData.events.map((ev, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                     <input type="text" placeholder="Camera Man" value={ev.cameraMan} onChange={(e)=>handleEventChange(i, 'cameraMan', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">HDD</label>
                     <input type="text" placeholder="HDD" value={ev.hdd} onChange={(e)=>handleEventChange(i, 'hdd', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Copied By</label>
                     <input type="text" placeholder="Copied By" value={ev.copiedBy} onChange={(e)=>handleEventChange(i, 'copiedBy', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div className="col-span-2 md:col-span-5">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                     <input type="text" placeholder="Notes" value={ev.notes} onChange={(e)=>handleEventChange(i, 'notes', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                </div>
            ))}
            </div>
          </div>

          <div className="flex justify-end relative z-10">
            <button onClick={handleCreate} className="app-btn-primary px-6 py-2.5 text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all">Save Project</button>
          </div>
        </div>
      )}

      {/* Apploye Projects Table layout */}
      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 z-10"></div>
        {/* Table Header Controls */}
        <div className="border-b border-gray-100/80 bg-white/50 px-6 py-4 flex items-center space-x-4 relative z-10">
           <div className="flex bg-gray-100/80 rounded-lg p-1 shadow-inner">
            <button className="px-4 py-1.5 text-sm bg-indigo-500 shadow-sm rounded-md text-white font-bold transition-colors">Active</button>
            <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-md font-bold transition-colors">Archived</button>
          </div>
          <div className="flex-1">
             <input type="text" placeholder="Search project by name & code..." className="app-input w-full max-w-md px-4 py-2 text-sm" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-gray-50/30 relative z-10">
           {projects.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full py-12">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <p className="text-gray-500 font-bold">No projects found.</p>
             </div>
           ) : (
             <div className="p-6 space-y-4">
               {projects.map(p => (
                 <div key={p._id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                   <div className="px-6 py-5 flex items-center cursor-pointer hover:bg-indigo-50/30 transition-colors" onClick={() => toggleRow(p._id)}>
                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold mr-5 shrink-0 shadow-sm">
                       {p.name ? p.name.substring(0,2).toUpperCase() : 'PR'}
                     </div>
                     <div className="w-1/4">
                       {editingId === p._id ? (
                         <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full" onClick={(e) => e.stopPropagation()} />
                       ) : (
                         <p className="font-extrabold text-gray-800 text-[15px] group-hover:text-indigo-600 transition-colors">{p.name}</p>
                       )}
                       <p className="text-xs font-semibold text-gray-400 mt-0.5">Project Code: #{p._id.substring(p._id.length - 6).toUpperCase()}</p>
                     </div>
                     <div className="w-1/4">
                       <p className="text-xs font-semibold text-gray-400 mb-0.5">Client</p>
                       <p className="text-sm font-bold text-gray-700">{p.client?.name || p.customer || '-'}</p>
                     </div>
                     <div className="w-1/4">
                        <p className="text-xs font-semibold text-gray-400 mb-0.5">Start Date</p>
                        <p className="text-sm font-bold text-gray-700">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}</p>
                     </div>
                     <div className="w-1/4 flex justify-end items-center space-x-4">
                       <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200">Active</span>
                       {editingId === p._id ? (
                         <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                           <button onClick={() => handleUpdate(p._id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Save</button>
                           <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Cancel</button>
                         </div>
                       ) : (
                         <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                           {isAdmin && (
                             <>
                               <button onClick={() => startEdit(p)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">Edit</button>
                               <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors">Delete</button>
                             </>
                           )}
                           <button onClick={(e) => { e.stopPropagation(); setViewProject(p); }} className="text-teal-600 hover:text-teal-800 font-bold text-sm transition-colors flex items-center"><Eye className="w-4 h-4 mr-1"/> View</button>
                         </div>
                       )}
                     </div>
                   </div>
                   
                   {/* Expanded Area matching screenshot cards */}
                   {expandedRows.has(p._id) && (
                     <div className="px-6 pb-6 pt-3 border-t border-gray-100 bg-gray-50/50">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                         <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-hover/card:text-indigo-500 transition-colors">Total Budget</p>
                           <p className="text-sm font-extrabold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Budget not set</p>
                         </div>
                         <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-hover/card:text-indigo-500 transition-colors">Spent Amount</p>
                           <p className="text-sm font-extrabold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Budget not set</p>
                         </div>
                         <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-hover/card:text-indigo-500 transition-colors">Spent Hours</p>
                           <p className="text-sm font-extrabold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">Time not tracked yet</p>
                         </div>
                         <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group/card">
                           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-hover/card:text-indigo-500 transition-colors">Billable Amount</p>
                           <p className="text-sm font-extrabold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">Billing not set</p>
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

      {/* Project Details Modal */}
      {viewProject && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100/50">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-extrabold text-gray-800">{viewProject.name} - Details</h2>
              <button onClick={() => setViewProject(null)} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm">&times;</button>
            </div>
            <div className="p-6 overflow-auto flex-1">
               <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 rounded-xl border border-indigo-100/50">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
