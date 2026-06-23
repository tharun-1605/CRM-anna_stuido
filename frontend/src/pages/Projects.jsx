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
  const [viewMode, setViewMode] = useState('List');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', client: '', description: '', startDate: '', endDate: '', priority: 'Medium', events: []
  });

  const addEvent = () => {
    setFormData({
      ...formData,
      events: [...formData.events, {
        date: '',
        startTime: '',
        endTime: '',
        eventType: '',
        location: '',
        notes: '',
        subServices: [{ service: '', cameraMan: '', hdd: '', copiedBy: '' }]
      }]
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

  const addSubService = (eventIndex) => {
    const newEvents = [...formData.events];
    const event = { ...newEvents[eventIndex] };
    event.subServices = [...(event.subServices || []), { service: '', cameraMan: '', hdd: '', copiedBy: '' }];
    newEvents[eventIndex] = event;
    setFormData({ ...formData, events: newEvents });
  };

  const removeSubService = (eventIndex, serviceIndex) => {
    const newEvents = [...formData.events];
    const event = { ...newEvents[eventIndex] };
    event.subServices = (event.subServices || []).filter((_, idx) => idx !== serviceIndex);
    if (event.subServices.length === 0) {
      event.subServices = [{ service: '', cameraMan: '', hdd: '', copiedBy: '' }];
    }
    newEvents[eventIndex] = event;
    setFormData({ ...formData, events: newEvents });
  };

  const handleSubServiceChange = (eventIndex, serviceIndex, field, value) => {
    const newEvents = [...formData.events];
    const event = { ...newEvents[eventIndex] };
    const newSubServices = [...(event.subServices || [])];
    newSubServices[serviceIndex] = { ...newSubServices[serviceIndex], [field]: value };
    event.subServices = newSubServices;
    newEvents[eventIndex] = event;
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
      events: (p.events || []).map(ev => ({
        ...ev,
        date: ev.date ? ev.date.split('T')[0] : '',
        subServices: ev.subServices && ev.subServices.length > 0 
          ? ev.subServices.map(ss => ({
              service: ss.service || '',
              cameraMan: ss.cameraMan || '',
              hdd: ss.hdd || '',
              copiedBy: ss.copiedBy || ''
            }))
          : [{ service: ev.service || '', cameraMan: ev.cameraMan || '', hdd: ev.hdd || '', copiedBy: ev.copiedBy || '' }]
      }))
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error('Project Name is required');
    
    // Ensure all subServices and legacy fields are populated
    const processedEvents = formData.events.map(ev => {
      const subServices = ev.subServices && ev.subServices.length > 0 
        ? ev.subServices 
        : [{ service: ev.service || '', cameraMan: ev.cameraMan || '', hdd: ev.hdd || '', copiedBy: ev.copiedBy || '' }];
      const firstSub = subServices[0];
      return {
        ...ev,
        service: firstSub.service || '',
        cameraMan: firstSub.cameraMan || '',
        hdd: firstSub.hdd || '',
        copiedBy: firstSub.copiedBy || '',
        subServices
      };
    });

    const payload = { ...formData, events: processedEvents };

    try {
      if (editingId) {
        await axios.put(`/projects/${editingId}`, payload);
        toast.success('Project updated successfully');
      } else {
        await axios.post('/projects', payload);
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
            <datalist id="eventTypesList">
              <option value="60th Wedding" />
              <option value="Baby Shower" />
              <option value="Birthday" />
              <option value="Corporate Events" />
              <option value="Ear Piercing Ceremony" />
              <option value="Engagement" />
              <option value="Get together" />
              <option value="House Warming" />
              <option value="Naming Ceremony" />
              <option value="Outdoor Post-Wedding" />
              <option value="Outdoor Pre-Wedding" />
              <option value="Puberty" />
              <option value="Reception" />
              <option value="Religious Events" />
              <option value="Rituals - Bride" />
              <option value="Rituals - Groom" />
              <option value="Wedding & Reception" />
            </datalist>
            <datalist id="servicesList">
              <option value="Traditional Photography" />
              <option value="Traditional Videography" />
              <option value="Candid Photography" />
              <option value="Candid Videography" />
              <option value="Cinematography" />
              <option value="Drone Shoot" />
              <option value="Pre-Wedding Shoot" />
              <option value="Post-Wedding Shoot" />
              <option value="Live Streaming" />
              <option value="LED Wall" />
              <option value="Photo Booth" />
              <option value="Album Printing" />
            </datalist>
            <datalist id="cameramenList">
              {users.map(u => <option key={u._id} value={u.name} />)}
            </datalist>
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
                     <input list="eventTypesList" type="text" placeholder="Select or type..." value={ev.eventType} onChange={(e)=>handleEventChange(i, 'eventType', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div className="col-span-2 md:col-span-2">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                     <input type="text" placeholder="Location" value={ev.location} onChange={(e)=>handleEventChange(i, 'location', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>
                   <div className="col-span-2 md:col-span-3">
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                     <input type="text" placeholder="Notes" value={ev.notes} onChange={(e)=>handleEventChange(i, 'notes', e.target.value)} className="app-input w-full px-2 py-1.5 text-xs" />
                   </div>

                   {/* Sub-services / Service Assignments list */}
                   <div className="col-span-2 md:col-span-5 border-t border-gray-200/40 pt-4 mt-2">
                     <div className="flex items-center justify-between mb-3">
                       <label className="block text-xs font-bold text-teal-600 uppercase tracking-wider">Services & Crew Assignments</label>
                       <button 
                         type="button" 
                         onClick={() => addSubService(i)} 
                         className="bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1 rounded-lg text-[10px] font-black transition-all flex items-center shadow-sm"
                       >
                         <Plus className="w-3 h-3 mr-1" /> Add Service Row
                       </button>
                     </div>
                     <div className="space-y-3">
                       {(ev.subServices || [{ service: '', cameraMan: '', hdd: '', copiedBy: '' }]).map((ss, sIdx) => (
                         <div key={sIdx} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/40 p-3 rounded-xl border border-white/80 relative group/subservice">
                           {(ev.subServices || []).length > 1 && (
                             <button 
                               type="button" 
                               onClick={() => removeSubService(i, sIdx)} 
                               className="absolute -top-1.5 -right-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-sm text-xs font-black"
                             >
                               &times;
                             </button>
                           )}
                           <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Service</label>
                             <input 
                               list="servicesList" 
                               type="text" 
                               placeholder="Select or type..." 
                               value={ss.service || ''} 
                               onChange={(e) => handleSubServiceChange(i, sIdx, 'service', e.target.value)} 
                               className="app-input w-full px-2 py-1 text-xs bg-white/80" 
                             />
                           </div>
                           <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Camera Man</label>
                             <input 
                               list="cameramenList"
                               type="text"
                               placeholder="Select or type..."
                               value={ss.cameraMan || ''} 
                               onChange={(e) => handleSubServiceChange(i, sIdx, 'cameraMan', e.target.value)} 
                               className="app-input w-full px-2 py-1 text-xs bg-white/80"
                             />
                           </div>
                           <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">HDD</label>
                             <input 
                               type="text" 
                               placeholder="HDD" 
                               value={ss.hdd || ''} 
                               onChange={(e) => handleSubServiceChange(i, sIdx, 'hdd', e.target.value)} 
                               className="app-input w-full px-2 py-1 text-xs bg-white/80" 
                             />
                           </div>
                           <div>
                             <label className="block text-[10px] font-bold text-gray-500 mb-1">Copied By</label>
                             <select 
                               value={ss.copiedBy || ''} 
                               onChange={(e) => handleSubServiceChange(i, sIdx, 'copiedBy', e.target.value)} 
                               className="app-input w-full px-2 py-1 text-xs bg-white/80"
                             >
                               <option value="">Select Member</option>
                               {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
                             </select>
                           </div>
                         </div>
                       ))}
                     </div>
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

        const kanbanStages = ['Upcoming Shoot', 'Raw Data Backup', 'Culling/Sorting', 'Editing/Retouching', 'Client Review', 'Final Delivery', 'Completed'];

        return (
          <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 z-10"></div>
            {/* Table Header Controls */}
            <div className="border-b border-white/40 bg-white/30 backdrop-blur-md px-6 py-4 flex items-center space-x-4 relative z-10">
               <div className="flex bg-white/40 backdrop-blur rounded-xl p-1.5 shadow-inner border border-white/50">
                <button onClick={() => setStatusFilter('Active')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${statusFilter === 'Active' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Active</button>
                <button onClick={() => setStatusFilter('Archived')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${statusFilter === 'Archived' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Archived</button>
              </div>
              <div className="flex bg-white/40 backdrop-blur rounded-xl p-1.5 shadow-inner border border-white/50">
                <button onClick={() => setViewMode('List')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${viewMode === 'List' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>List</button>
                <button onClick={() => setViewMode('Kanban')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${viewMode === 'Kanban' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Kanban</button>
              </div>
              <div className="flex-1">
                 <input type="text" placeholder="Search project by name & code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="app-input w-full max-w-md px-4 py-2 text-sm ml-auto block" />
              </div>
            </div>
        
        {/* Table/Kanban Body */}
        {viewMode === 'Kanban' ? (
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar bg-transparent relative z-10 flex space-x-6 pb-8">
            {kanbanStages.map(stage => {
              const stageProjects = filteredProjects.filter(p => (p.status === stage) || (!p.status && stage === 'Upcoming Shoot') || (stage === 'Upcoming Shoot' && p.status === 'Pending') || (stage === 'Editing/Retouching' && p.status === 'In Progress'));
              return (
                <div key={stage} className="flex-shrink-0 w-[340px] flex flex-col bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm h-full max-h-full">
                  <div className="p-4 border-b border-white/40 flex justify-between items-center bg-white/40 rounded-t-2xl">
                     <h3 className="font-extrabold text-gray-700 tracking-tight">{stage}</h3>
                     <span className="bg-white/80 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-black shadow-sm">{stageProjects.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {stageProjects.map(p => (
                      <div key={p._id} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => setViewProject(p)}>
                        <div className="flex justify-between items-start mb-3">
                           <h4 className="font-black text-gray-800 text-[15px] group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2" title={p.name}>{p.name}</h4>
                           <div className="flex flex-col space-y-1 items-end shrink-0 ml-3">
                             {p.priority === 'High' && <span className="bg-red-100 text-red-600 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">High</span>}
                             {p.priority === 'Medium' && <span className="bg-yellow-100 text-yellow-700 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Med</span>}
                             {p.priority === 'Low' && <span className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Low</span>}
                           </div>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mb-4 bg-white/50 px-2.5 py-1.5 rounded-lg border border-white/60 inline-block truncate max-w-full">{p.client?.name || p.customer || 'No Client'}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                           <span className={`text-[10px] uppercase tracking-wider font-bold flex items-center ${p.endDate && new Date(p.endDate) < new Date() && p.status !== 'Completed' ? 'text-red-500 bg-red-50 px-2 py-1 rounded-md' : 'text-gray-400'}`}>
                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'No Deadline'}
                           </span>
                        </div>
                        
                        {isAdmin && (
                          <div onClick={(e) => e.stopPropagation()} className="pt-3 border-t border-gray-100">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Update Status</label>
                            <select 
                              value={['Pending', 'In Progress'].includes(p.status) ? (p.status === 'Pending' ? 'Upcoming Shoot' : 'Editing/Retouching') : (p.status || 'Upcoming Shoot')} 
                              onChange={async (e) => {
                                try {
                                  await axios.put(`/projects/${p._id}`, { status: e.target.value });
                                  toast.success('Status updated');
                                  fetchData();
                                } catch(err) { toast.error('Failed to update status'); }
                              }} 
                              className="w-full bg-gray-50/50 hover:bg-white border border-gray-200 hover:border-indigo-300 text-xs font-bold text-gray-700 rounded-xl px-3 py-2 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              <option value="Pending" className="hidden">Pending</option>
                              <option value="In Progress" className="hidden">In Progress</option>
                              {kanbanStages.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                    {stageProjects.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-white/50 rounded-2xl bg-white/20">
                         <p className="text-gray-400 text-xs font-extrabold uppercase tracking-widest">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
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
                       <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${['Completed', 'Final Delivery'].includes(p.status) ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ['In Progress', 'Editing/Retouching', 'Raw Data Backup'].includes(p.status) ? 'bg-blue-100 text-blue-700 border-blue-200' : ['Upcoming Shoot', 'Culling/Sorting', 'Client Review'].includes(p.status) ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{p.status || 'Upcoming Shoot'}</span>
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
        )}
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
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {ev.subServices && ev.subServices.length > 0 ? (
                                <div className="space-y-1">
                                  {ev.subServices.map((ss, idx) => (
                                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-0.5 last:pb-0">{ss.service || '-'}</div>
                                  ))}
                                </div>
                              ) : (
                                ev.service || '-'
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-medium">{ev.location || '-'}</td>
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {ev.subServices && ev.subServices.length > 0 ? (
                                <div className="space-y-1">
                                  {ev.subServices.map((ss, idx) => (
                                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-0.5 last:pb-0">{ss.cameraMan || '-'}</div>
                                  ))}
                                </div>
                              ) : (
                                ev.cameraMan || '-'
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {ev.subServices && ev.subServices.length > 0 ? (
                                <div className="space-y-1">
                                  {ev.subServices.map((ss, idx) => (
                                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-0.5 last:pb-0">{ss.hdd || '-'}</div>
                                  ))}
                                </div>
                              ) : (
                                ev.hdd || '-'
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {ev.subServices && ev.subServices.length > 0 ? (
                                <div className="space-y-1">
                                  {ev.subServices.map((ss, idx) => (
                                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-0.5 last:pb-0">{ss.copiedBy || '-'}</div>
                                  ))}
                                </div>
                              ) : (
                                ev.copiedBy || '-'
                              )}
                            </td>
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
                           <p className="flex justify-between items-center"><span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Assignee</span> <span className="font-bold text-gray-800">{task.user?.name || task.team?.name || 'Unassigned'}</span></p>
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
