import React, { useState, useEffect } from 'react';
import { Plus, Users, Download } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { exportToCSV } from '../utils/exportUtils';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '' });
  const [statusFilter, setStatusFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');

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
  const [editData, setEditData] = useState({ name: '', company: '', email: '', phone: '' });
  
  const startEdit = (c) => {
    setEditingId(c._id);
    setEditData({ name: c.name, company: c.company || '', email: c.email || '', phone: c.phone || '' });
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
      setFormData({ name: '', email: '', company: '', phone: '' });
      fetchClients();
    } catch (error) {
      toast.error('Failed to add client');
    }
  };

  const handleExport = () => {
    const filteredClients = clients.filter(c => {
      const matchesStatus = statusFilter === 'All' ? true : (statusFilter === 'Active' ? c.status !== 'Archived' : c.status === 'Archived');
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term) || c.company?.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });

    const exportData = filteredClients.map(c => ({
      Name: c.name,
      Company: c.company || '',
      Email: c.email || '',
      Phone: c.phone || '',
      Projects: c.projects ? c.projects.map(p => p.name).join(' | ') : '',
      Status: c.status || 'Active'
    }));
    exportToCSV(exportData, 'Clients_Export');
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Clients</h1>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="bg-white/60 backdrop-blur border border-white/50 text-gray-700 hover:bg-white/80 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all rounded-xl">
            <Plus className="w-5 h-5 mr-2" /> Add Client
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 relative z-10">Add New Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end relative z-10">
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
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Phone Number</label>
              <input type="text" placeholder="+1 234 567 8900" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full app-input px-4 py-2.5 text-sm" />
            </div>
            <button onClick={handleCreate} className="app-btn-primary px-6 py-2.5 text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all w-full">Save Client</button>
          </div>
        </div>
      )}

      {(() => {
        const filteredClients = clients.filter(c => {
          const matchesStatus = statusFilter === 'All' ? true : (statusFilter === 'Active' ? c.status !== 'Archived' : c.status === 'Archived');
          const term = searchTerm.toLowerCase();
          const matchesSearch = !term || (c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term) || c.company?.toLowerCase().includes(term));
          return matchesStatus && matchesSearch;
        });

        return (
          <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="border-b border-white/40 bg-white/30 backdrop-blur-md px-6 py-4 flex items-center space-x-6 relative z-10">
           <div className="w-48">
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 pl-1">Status Filter</label>
              <div className="flex bg-white/40 backdrop-blur rounded-xl p-1.5 shadow-inner border border-white/50">
                <button onClick={() => setStatusFilter('Active')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all w-1/2 ${statusFilter === 'Active' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Active</button>
                <button onClick={() => setStatusFilter('Archived')} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all w-1/2 ${statusFilter === 'Archived' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>Archived</button>
              </div>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 pl-1">Search Client</label>
              <input type="text" placeholder="Search by name, email, or company..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="app-input w-full px-4 py-2 text-sm bg-white/50" />
           </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-transparent p-6 relative z-10">
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24">
              <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 flex items-center justify-center mb-6 shadow-sm">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-black text-xl mb-2 tracking-tight">No clients found</h2>
              <p className="text-gray-500 font-medium text-sm">Add a new client to get started tracking projects.</p>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-gray-500 bg-white/30 border-b border-white/40 uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-6 py-5">Client Name</th>
                    <th className="px-6 py-5">Company</th>
                    <th className="px-6 py-5">Email</th>
                    <th className="px-6 py-5">Phone</th>
                    <th className="px-6 py-5">Projects</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredClients.map(c => (
                     <tr key={c._id} className="hover:bg-white/40 transition-colors group">
                        
                        <td className="px-6 py-4">
                          {editingId === c._id ? (
                            <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 flex items-center justify-center font-black mr-4 shadow-sm text-sm group-hover:scale-110 transition-transform">
                                {c.name.substring(0,2).toUpperCase()}
                              </div>
                              <span className="font-bold text-gray-800 tracking-tight">{c.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-bold">
                          {editingId === c._id ? <input type="text" value={editData.company} onChange={e=>setEditData({...editData, company: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/> : (c.company || '-')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {editingId === c._id ? <input type="text" value={editData.email} onChange={e=>setEditData({...editData, email: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/> : (
                            <a href={`mailto:${c.email}`} className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">{c.email || '-'}</a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {editingId === c._id ? <input type="text" value={editData.phone} onChange={e=>setEditData({...editData, phone: e.target.value})} className="app-input px-3 py-1.5 text-sm w-full"/> : (
                            <a href={`tel:${c.phone}`} className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">{c.phone || '-'}</a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {c.projects && c.projects.length > 0 ? (
                            <div className="flex flex-col space-y-2">
                              {c.projects.map(p => (
                                <div key={p._id} className="h-6 flex items-center">
                                  <span className="text-sm font-bold text-gray-800 truncate max-w-[150px] bg-white/50 backdrop-blur px-2 py-0.5 rounded-lg border border-white/60" title={p.name}>{p.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-white/40 backdrop-blur px-2.5 py-1 rounded-lg border border-white/50">No projects</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {c.projects && c.projects.length > 0 ? (
                            <div className="flex flex-col space-y-2 items-center">
                              {c.projects.map(p => (
                                <div key={p._id} className="h-6 flex items-center">
                                  <span className={`text-[10px] uppercase tracking-wider w-max px-2.5 py-1 rounded-full font-bold border backdrop-blur-sm ${p.status === 'Completed' ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200' : p.status === 'In Progress' ? 'bg-blue-50/50 text-blue-700 border-blue-200' : 'bg-gray-100/50 text-gray-700 border-gray-200'}`}>
                                    {p.status || 'Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="bg-white/40 backdrop-blur text-gray-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-white/60">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === c._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleUpdate(c._id)} className="bg-emerald-100/50 backdrop-blur border border-emerald-200 text-emerald-700 hover:bg-emerald-200/50 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-white/50 backdrop-blur border border-white/60 text-gray-700 hover:bg-white/80 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm">Cancel</button>
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
      ); })()}
    </div>
  );
}
