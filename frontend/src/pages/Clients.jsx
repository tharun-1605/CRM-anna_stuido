import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });

  const fetchClients = async () => {
    try {
      const { data } = await axios.get('/clients');
      setClients(data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  
  const handleDelete = async (id) => {
    if(!window.confirm('Delete this client?')) return;
    try {
      await axios.delete(`/clients/${id}`);
      toast.success('Client deleted');
      fetchClients();
    } catch(err) { toast.error('Failed to delete client'); }
  };


  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', company: '', email: '' });
  
  const startEdit = (c) => {
    setEditingId(c._id);
    setEditData({ name: c.name, company: c.company || '', email: c.email || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/clients/${id}`, editData);
      toast.success('Client updated');
      setEditingId(null);
      fetchClients();
    } catch(err) { toast.error('Failed to update client'); }
  };

  const handleCreate = async () => {
    if (!formData.name) return toast.error('Client name is required');
    try {
      await axios.post('/clients', formData);
      toast.success('Client added successfully');
      setIsFormOpen(false);
      setFormData({ name: '', email: '', company: '' });
      fetchClients();
    } catch (error) {
      toast.error('Failed to add client');
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-4 py-2 flex items-center text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </button>
      </div>

      {isFormOpen && (
        <div className="app-card p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Add New Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Client Name *</label>
              <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Company</label>
              <input type="text" value={formData.company} onChange={(e)=>setFormData({...formData, company: e.target.value})} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="app-btn-primary px-4 py-2 text-sm w-full">Save Client</button>
          </div>
        </div>
      )}

      <div className="app-card flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
           <div className="w-32">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Type</label>
              <div className="flex bg-gray-100 rounded p-1">
                <button className="px-3 py-1 text-xs bg-teal-500 shadow-sm rounded text-white font-medium">Active</button>
                <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 rounded font-medium">Archived</button>
              </div>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Search client</label>
              <input type="text" placeholder="Search by client info..." className="app-input w-full px-3 py-1.5 text-xs" />
           </div>
        </div>
        
        <div className={`flex-1 overflow-auto ${clients.length === 0 ? 'flex flex-col items-center justify-center p-10 bg-[#F9FAFB]' : 'bg-white p-4'}`}>
          {clients.length === 0 ? (
            <>
              <svg className="w-40 h-40 mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="70" width="80" height="50" rx="8" fill="#1e293b" opacity="0.1"/>
                <rect x="60" y="80" width="80" height="50" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
                <line x1="75" y1="95" x2="105" y2="95" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
                <rect x="65" y="90" width="3" height="15" fill="#f97316"/>
              </svg>
              <h2 className="text-gray-700 font-bold text-lg">No active clients found.</h2>
            </>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="pb-3 font-semibold">Client Name</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                   <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                      
                      <td className="py-3 text-gray-800 font-medium">
                        {editingId === c._id ? <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-2 py-1 text-sm"/> : c.name}
                      </td>
                      <td className="py-3 text-gray-600">
                        {editingId === c._id ? <input type="text" value={editData.company} onChange={e=>setEditData({...editData, company: e.target.value})} className="app-input px-2 py-1 text-sm"/> : (c.company || '-')}
                      </td>
                      <td className="py-3 text-gray-600">
                        {editingId === c._id ? <input type="text" value={editData.email} onChange={e=>setEditData({...editData, email: e.target.value})} className="app-input px-2 py-1 text-sm"/> : (c.email || '-')}
                      </td>
                      <td className="py-3 text-center">
                        <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded border border-teal-200">{c.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        {editingId === c._id ? (
                          <>
                            <button onClick={() => handleUpdate(c._id)} className="text-green-600 font-medium mr-3">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(c)} className="text-teal-600 font-medium mr-3">Edit</button>
                            <button onClick={() => handleDelete(c._id)} className="text-red-500 font-medium">Delete</button>
                          </>
                        )}
                      </td>
                   </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
