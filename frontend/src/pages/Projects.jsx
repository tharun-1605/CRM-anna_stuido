import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', projectType: '', customer: '', location: '', startDate: '', endDate: '', eventDuration: 'Full Day'
  });

  const fetchData = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        axios.get('/projects'),
        axios.get('/work')
      ]);
      setProjects(pRes.data);
      setAssignments(aRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) return toast.error('Project Name is required');
    try {
      await axios.post('/projects', formData);
      toast.success('Project created successfully');
      fetchData();
      setIsFormOpen(false);
      setFormData({ name: '', projectType: '', customer: '', location: '', startDate: '', endDate: '', eventDuration: 'Full Day' });
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
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-4 py-2 flex items-center text-sm">
          <Plus className="w-4 h-4 mr-2" /> Create Project
        </button>
      </div>

      {isFormOpen && (
        <div className="app-card p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Project Name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="app-input px-3 py-2 text-sm" />
            <input type="text" placeholder="Customer" value={formData.customer} onChange={(e)=>setFormData({...formData, customer: e.target.value})} className="app-input px-3 py-2 text-sm" />
            <input type="date" value={formData.startDate} onChange={(e)=>setFormData({...formData, startDate: e.target.value})} className="app-input px-3 py-2 text-sm" />
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
                       {p.name.substring(0,2).toUpperCase()}
                     </div>
                     <div className="w-1/4">
                       <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                       <p className="text-xs text-gray-400">Project Code: -</p>
                     </div>
                     <div className="w-1/4 text-sm text-gray-600">{p.customer || '-'}</div>
                     <div className="w-1/4 text-sm text-gray-600">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}
                     </div>
                     <div className="w-1/4 flex justify-end">
                       <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">Open</span>
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
    </div>
  );
}
