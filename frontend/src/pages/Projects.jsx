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
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        {isAdmin && (
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-4 py-2 flex items-center text-sm">
            <Plus className="w-4 h-4 mr-2" /> Create Project
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="app-card p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Project Name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="app-input px-3 py-2 text-sm" />
            <select value={formData.client} onChange={(e)=>setFormData({...formData, client: e.target.value})} className="app-input px-3 py-2 text-sm">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input type="date" placeholder="Start Date" value={formData.startDate} onChange={(e)=>setFormData({...formData, startDate: e.target.value})} className="app-input px-3 py-2 text-sm" />
            <input type="date" placeholder="End Date" value={formData.endDate} onChange={(e)=>setFormData({...formData, endDate: e.target.value})} className="app-input px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="app-input px-3 py-2 text-sm lg:col-span-2" rows="1"></textarea>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700 text-sm">Events Details</h4>
                <button onClick={addEvent} className="text-teal-600 text-sm font-medium hover:underline">+ Add Event</button>
            </div>
            {formData.events.map((ev, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 p-2 border border-gray-200 rounded">
                   <input type="date" placeholder="Date" value={ev.date} onChange={(e)=>handleEventChange(i, 'date', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="time" placeholder="Start Time" value={ev.startTime} onChange={(e)=>handleEventChange(i, 'startTime', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="time" placeholder="End Time" value={ev.endTime} onChange={(e)=>handleEventChange(i, 'endTime', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="Event Type" value={ev.eventType} onChange={(e)=>handleEventChange(i, 'eventType', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="Service" value={ev.service} onChange={(e)=>handleEventChange(i, 'service', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="Location" value={ev.location} onChange={(e)=>handleEventChange(i, 'location', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="Camera Man" value={ev.cameraMan} onChange={(e)=>handleEventChange(i, 'cameraMan', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="HDD" value={ev.hdd} onChange={(e)=>handleEventChange(i, 'hdd', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="Copied By" value={ev.copiedBy} onChange={(e)=>handleEventChange(i, 'copiedBy', e.target.value)} className="app-input px-2 py-1 text-xs" />
                   <input type="text" placeholder="Notes" value={ev.notes} onChange={(e)=>handleEventChange(i, 'notes', e.target.value)} className="app-input px-2 py-1 text-xs" />
                </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button onClick={handleCreate} className="app-btn-primary px-4 py-2 text-sm">Save Project</button>
          </div>
        </div>
      )}

      {/* Apploye Projects Table layout */}
      <div className="app-card flex-1 overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
           <div className="flex bg-gray-100 rounded p-1">
            <button className="px-3 py-1 text-xs bg-teal-500 shadow-sm rounded text-white font-medium">Active</button>
            <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 rounded font-medium">Archived</button>
          </div>
          <div className="flex-1">
             <input type="text" placeholder="Search project by name & code..." className="app-input w-64 px-3 py-1.5 text-xs" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-auto bg-[#F9FAFB]">
           {projects.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full">
               <p className="text-gray-500 font-medium">No projects found.</p>
             </div>
           ) : (
             <div className="p-4 space-y-4">
               {projects.map(p => (
                 <div key={p._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                   <div className="px-5 py-4 flex items-center cursor-pointer hover:bg-gray-50" onClick={() => toggleRow(p._id)}>
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4 shrink-0">
                       {p.name ? p.name.substring(0,2).toUpperCase() : 'PR'}
                     </div>
                     <div className="w-1/4">
                       {editingId === p._id ? (
                         <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="app-input px-2 py-1 text-sm w-full" onClick={(e) => e.stopPropagation()} />
                       ) : (
                         <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                       )}
                       <p className="text-xs text-gray-400">Project Code: -</p>
                     </div>
                     <div className="w-1/4 text-sm text-gray-600">{p.client?.name || p.customer || '-'}</div>
                     <div className="w-1/4 text-sm text-gray-600">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}
                     </div>
                     <div className="w-1/4 flex justify-end items-center space-x-3">
                       <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">Open</span>
                       {editingId === p._id ? (
                         <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                           <button onClick={() => handleUpdate(p._id)} className="text-green-600 font-medium hover:underline text-xs">Save</button>
                           <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium hover:underline text-xs">Cancel</button>
                         </div>
                       ) : (
                         <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                           <button onClick={() => setViewProject(p)} className="text-blue-500 hover:bg-blue-50 p-1 rounded" title="View Details">
                             <Eye className="w-4 h-4" />
                           </button>
                           {isAdmin && <button onClick={() => startEdit(p)} className="text-teal-600 font-medium hover:underline text-xs">Edit</button>}
                           {isAdmin && <button onClick={() => handleDelete(p._id)} className="text-red-500 font-medium hover:underline text-xs">Delete</button>}
                         </div>
                       )}
                     </div>
                   </div>
                   
                   {/* Expanded Area matching screenshot cards */}
                   {expandedRows.has(p._id) && (
                     <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50">
                       <div className="grid grid-cols-4 gap-4 mt-4">
                         <div className="bg-white border border-gray-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
                           <p className="text-xs text-gray-500 mb-2">Total Budget</p>
                           <p className="text-sm font-semibold text-teal-600">Budget not set</p>
                         </div>
                         <div className="bg-white border border-gray-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
                           <p className="text-xs text-gray-500 mb-2">Spent Amount</p>
                           <p className="text-sm font-semibold text-teal-600">Budget not set</p>
                         </div>
                         <div className="bg-white border border-gray-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
                           <p className="text-xs text-gray-500 mb-2">Spent Hours</p>
                           <p className="text-sm font-semibold text-gray-400">Time not tracked yet</p>
                         </div>
                         <div className="bg-white border border-gray-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
                           <p className="text-xs text-gray-500 mb-2">Billable Amount</p>
                           <p className="text-sm font-semibold text-gray-400">Billing not set</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{viewProject.name} - Details</h2>
              <button onClick={() => setViewProject(null)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4 overflow-auto flex-1">
               <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded">
                  <div><span className="text-gray-500">Client:</span> <br/><strong>{viewProject.client?.name || viewProject.customer || '-'}</strong></div>
                  <div><span className="text-gray-500">Start Date:</span> <br/><strong>{viewProject.startDate ? new Date(viewProject.startDate).toLocaleDateString() : '-'}</strong></div>
                  <div><span className="text-gray-500">End Date:</span> <br/><strong>{viewProject.endDate ? new Date(viewProject.endDate).toLocaleDateString() : '-'}</strong></div>
                  <div className="col-span-2 md:col-span-4"><span className="text-gray-500">Description:</span> <br/><strong>{viewProject.description || '-'}</strong></div>
               </div>
               
               <h3 className="font-semibold text-gray-700 mb-3">Events</h3>
               {viewProject.events && viewProject.events.length > 0 ? (
                 <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                   <table className="min-w-full text-xs divide-y divide-gray-300">
                     <thead className="bg-gray-900 text-white">
                       <tr>
                         <th className="py-2 px-3 text-left font-semibold">Date</th>
                         <th className="py-2 px-3 text-left font-semibold">Start</th>
                         <th className="py-2 px-3 text-left font-semibold">End</th>
                         <th className="py-2 px-3 text-left font-semibold">Event Type</th>
                         <th className="py-2 px-3 text-left font-semibold">Service</th>
                         <th className="py-2 px-3 text-left font-semibold">Location</th>
                         <th className="py-2 px-3 text-left font-semibold">Camera Man</th>
                         <th className="py-2 px-3 text-left font-semibold">HDD</th>
                         <th className="py-2 px-3 text-left font-semibold">Copied By</th>
                         <th className="py-2 px-3 text-left font-semibold">Notes</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 bg-white">
                       {viewProject.events.map((ev, i) => (
                         <tr key={i} className="hover:bg-gray-50">
                           <td className="py-2 px-3 whitespace-nowrap">{ev.date ? new Date(ev.date).toLocaleDateString() : '-'}</td>
                           <td className="py-2 px-3 whitespace-nowrap">{ev.startTime || '-'}</td>
                           <td className="py-2 px-3 whitespace-nowrap">{ev.endTime || '-'}</td>
                           <td className="py-2 px-3">{ev.eventType || '-'}</td>
                           <td className="py-2 px-3">{ev.service || '-'}</td>
                           <td className="py-2 px-3">{ev.location || '-'}</td>
                           <td className="py-2 px-3">{ev.cameraMan || '-'}</td>
                           <td className="py-2 px-3">{ev.hdd || '-'}</td>
                           <td className="py-2 px-3">{ev.copiedBy || '-'}</td>
                           <td className="py-2 px-3">{ev.notes || '-'}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center">No events added for this project.</p>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
