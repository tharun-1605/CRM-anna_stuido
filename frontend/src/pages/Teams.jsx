import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', members: [] });
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchData = async () => {
    try {
      const [tRes, uRes] = await Promise.all([
        axios.get('/teams'),
        axios.get('/auth/users')
      ]);
      setTeams(tRes.data);
      setUsers(uRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) return toast.error('Team name is required');
    try {
      await axios.post('/teams', formData);
      toast.success('Team created successfully');
      setIsFormOpen(false);
      setFormData({ name: '', description: '', members: [] });
      fetchData();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const startEdit = (team) => {
    setEditingTeamId(team._id);
    setEditName(team.name);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/teams/${id}`, { name: editName });
      toast.success('Team updated');
      setEditingTeamId(null);
      fetchData();
    } catch(err) { toast.error('Failed to update team'); }
  };

  const handleDeleteTeam = async (id) => {
    if(!window.confirm('Delete this team?')) return;
    try {
      await axios.delete(`/teams/${id}`);
      toast.success('Team deleted');
      fetchData();
    } catch(err) { toast.error('Failed to delete team'); }
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const members = prev.members.includes(userId) 
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
          <Users className="w-8 h-8 mr-3 text-teal-500" />
          Teams
        </h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all">
          <Plus className="w-5 h-5 mr-2" /> Add Team
        </button>
      </div>

      {isFormOpen && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 relative z-10 border-b border-gray-100/80 pb-4">Create New Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Team Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Engineering Team" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full app-input px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea placeholder="What does this team do?" value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="w-full app-input px-4 py-2.5 text-sm" rows="3" />
              </div>
              <button onClick={handleCreate} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 px-6 py-2.5 text-sm w-full rounded-xl font-bold transition-all transform hover:-translate-y-0.5">Save Team</button>
            </div>
            
            <div className="flex flex-col h-full">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select Members</label>
              <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-2 shadow-inner">
                {users.map(u => (
                  <label key={u._id} className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer bg-white p-3 rounded-lg border border-gray-100 hover:border-teal-300 hover:shadow-sm transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.members.includes(u._id)}
                      onChange={() => handleMemberToggle(u._id)}
                      className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500 border-gray-300" 
                    />
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-extrabold text-[10px] mr-3 shadow-sm">
                        {u.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-bold">{u.name} <span className="text-gray-400 font-medium">({u.email})</span></span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="app-card flex-1 overflow-hidden flex flex-col p-6 animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="mb-6 relative z-10 flex items-center justify-between">
          <div className="w-1/2">
            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Search Team</label>
            <div className="relative">
               <input type="text" placeholder="Search by team & member name..." className="app-input w-full pl-4 pr-10 py-2 text-sm shadow-sm" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto relative z-10 custom-scrollbar">
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24 bg-white/40 rounded-xl border border-gray-100/50">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-extrabold text-xl mb-2">No teams found</h2>
              <p className="text-gray-400 font-medium text-sm">Create a new team to start collaborating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {teams.map(team => (
                <div key={team._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingTeamId === team._id ? (
                      <div className="flex space-x-2">
                        <button onClick={() => handleUpdate(team._id)} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-xs font-bold transition-colors">Save</button>
                        <button onClick={() => setEditingTeamId(null)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded-md text-xs font-bold transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex space-x-2 bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                        <button onClick={() => startEdit(team)} className="text-teal-600 hover:bg-teal-50 px-2 py-1 rounded text-xs font-bold transition-colors">Edit</button>
                        <button onClick={() => handleDeleteTeam(team._id)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold transition-colors">Delete</button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 pt-2">
                    {editingTeamId === team._id ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="app-input px-3 py-1.5 text-sm w-3/4 mb-2 font-bold" />
                    ) : (
                      <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-teal-700 transition-colors">{team.name}</h3>
                    )}
                    <p className="text-sm text-gray-500 font-medium h-10 overflow-hidden line-clamp-2">{team.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="border-t border-gray-100/80 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Members</p>
                      <span className="bg-teal-50 text-teal-700 text-xs font-extrabold px-2 py-0.5 rounded-full border border-teal-100">{team.members.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.members.slice(0, 5).map(m => (
                        <div key={m._id} className="flex items-center bg-gray-50 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-gray-200/60 shadow-sm" title={m.name}>
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-[8px] mr-1.5">
                            {m.name.substring(0,1).toUpperCase()}
                          </div>
                          {m.name.split(' ')[0]}
                        </div>
                      ))}
                      {team.members.length > 5 && (
                        <div className="flex items-center bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-1 rounded-md border border-gray-200/60 shadow-sm">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
