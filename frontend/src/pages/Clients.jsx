import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Clients</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all">
          <Plus className="w-5 h-5 mr-2" /> Add Client
        </button>
      </div>

      {isFormOpen && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 relative z-10">Add New Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Client Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Acme Corp" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" placeholder="contact@acme.com" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Company</label>
              <input type="text" placeholder="Company Name" value={formData.company} onChange={(e)=>setFormData({...formData, company: e.target.value})} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <button onClick={handleCreate} className="app-btn-primary px-6 py-2.5 text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all w-full">Save Client</button>
          </div>
        </div>
      )}

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="border-b border-gray-100/80 bg-white/50 px-6 py-4 flex items-center space-x-6 relative z-10">
           <div className="w-48">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Status Filter</label>
              <div className="flex bg-gray-100/80 rounded-lg p-1 shadow-inner">
                <button className="px-4 py-1.5 text-sm bg-indigo-500 shadow-sm rounded-md text-white font-bold transition-colors w-1/2">Active</button>
                <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-md font-bold transition-colors w-1/2">Archived</button>
              </div>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Search Client</label>
              <input type="text" placeholder="Search by name, email, or company..." className="app-input w-full px-4 py-2 text-sm" />
           </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-white/40 backdrop-blur-sm p-6 relative z-10">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-extrabold text-xl mb-2">No clients found</h2>
              <p className="text-gray-400 font-medium text-sm">Add a new client to get started tracking projects.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50/80 border-b border-gray-200/60 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Client Name</th>
                    <th className="px-6 py-4 font-bold">Company</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map(c => (
                     <tr key={c._id} className="hover:bg-teal-50/30 transition-colors group">
                        
                        <td className="px-6 py-4">
                          {editingId === c._id ? (
                            <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 flex items-center justify-center font-extrabold mr-3 shadow-sm text-xs">
                                {c.name.substring(0,2).toUpperCase()}
                              </div>
                              <span className="font-bold text-gray-800">{c.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {editingId === c._id ? <input type="text" value={editData.company} onChange={e=>setEditData({...editData, company: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/> : (c.company || '-')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {editingId === c._id ? <input type="text" value={editData.email} onChange={e=>setEditData({...editData, email: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/> : (
                            <a href={`mailto:${c.email}`} className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">{c.email || '-'}</a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-200">{c.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === c._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdate(c._id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(c)} className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Edit</button>
                              <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-700 font-bold transition-colors">Delete</button>
                            </div>
                          )}
                        </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
