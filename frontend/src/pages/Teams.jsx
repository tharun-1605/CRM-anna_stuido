import React, { useState, useEffect } from 'react';
import { Plus, Users, Download } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { exportToCSV } from '../utils/exportUtils';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', members: [] });
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    setFormData({
      name: team.name,
      description: team.description || '',
      members: (team.members || []).filter(m => m).map(m => m._id)
    });
    setIsFormOpen(true);
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (id) => {
    if (!formData.name) return toast.error('Team name is required');
    try {
      await axios.put(`/teams/${id}`, formData);
      toast.success('Team updated successfully');
      setEditingTeamId(null);
      setIsFormOpen(false);
      setFormData({ name: '', description: '', members: [] });
      fetchData();
    } catch (err) {
      toast.error('Failed to update team');
    }
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

  const handleExport = () => {
    const filteredTeams = teams.filter(t => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const matchesName = t.name?.toLowerCase().includes(term);
      const matchesMember = t.members?.some(m => m?.name?.toLowerCase().includes(term));
      return matchesName || matchesMember;
    });

    const exportData = filteredTeams.map(t => ({
      TeamName: t.name,
      Description: t.description || '',
      MembersCount: t.members?.filter(m => m).length || 0,
      Members: t.members?.filter(m => m).map(m => m.name).join(' | ') || ''
    }));
    exportToCSV(exportData, 'Teams_Export');
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
          <Users className="w-8 h-8 mr-3 text-teal-500" />
          Teams
        </h1>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="bg-white/60 backdrop-blur border border-white/50 text-gray-700 hover:bg-white/80 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
          <button 
            onClick={() => {
              if (isFormOpen && editingTeamId) {
                setEditingTeamId(null);
                setFormData({ name: '', description: '', members: [] });
              } else {
                setIsFormOpen(!isFormOpen);
                if (!isFormOpen) {
                  setEditingTeamId(null);
                  setFormData({ name: '', description: '', members: [] });
                }
              }
            }} 
            className="app-btn-primary px-5 py-2.5 flex items-center text-sm font-bold shadow-lg hover:shadow-teal-500/25 transition-all rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Team
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="app-card p-8 mb-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 relative z-10 border-b border-gray-100/80 pb-4">
            {editingTeamId ? 'Edit Team' : 'Create New Team'}
          </h3>
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
              {editingTeamId ? (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleUpdate(editingTeamId)} 
                    className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 px-6 py-2.5 text-sm rounded-xl font-bold transition-all transform hover:-translate-y-0.5"
                  >
                    Update Team
                  </button>
                  <button 
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingTeamId(null);
                      setFormData({ name: '', description: '', members: [] });
                    }} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 text-sm rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleCreate} 
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-teal-500/30 px-6 py-2.5 text-sm w-full rounded-xl font-bold transition-all transform hover:-translate-y-0.5"
                >
                  Save Team
                </button>
              )}
            </div>
            
            <div className="flex flex-col h-[300px]">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select Members</label>
              <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-2 shadow-inner custom-scrollbar">
                {users.map(u => (
                  <label key={u._id} className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer bg-white/60 backdrop-blur p-3 rounded-xl border border-white/60 hover:border-teal-400 hover:shadow-md transition-all">
                    <input 
                      type="checkbox" 
                      checked={formData.members.includes(u._id)}
                      onChange={() => handleMemberToggle(u._id)}
                      className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500 border-gray-300 shadow-inner" 
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black text-xs mr-3 shadow-sm">
                        {u.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-bold tracking-tight">{u.name} <span className="text-gray-400 font-medium">({u.email})</span></span>
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
               <input type="text" placeholder="Search by team & member name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="app-input w-full pl-4 pr-10 py-2 text-sm shadow-sm" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto relative z-10 custom-scrollbar">
          {(() => {
            const filteredTeams = teams.filter(t => {
              const term = searchTerm.toLowerCase();
              if (!term) return true;
              const matchesName = t.name?.toLowerCase().includes(term);
              const matchesMember = t.members?.some(m => m.name?.toLowerCase().includes(term));
              return matchesName || matchesMember;
            });

            return filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24 bg-white/30 backdrop-blur rounded-3xl border border-white/40 shadow-sm">
              <div className="w-24 h-24 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/60">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-black text-2xl mb-2 tracking-tight">No teams found</h2>
              <p className="text-gray-500 font-medium text-base">Create a new team to start collaborating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredTeams.map(team => (
                <div key={team._id} className={`backdrop-blur-xl border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500 hover:-translate-y-1 relative group overflow-hidden ${
                  editingTeamId === team._id 
                    ? 'bg-teal-50/50 border-teal-400 ring-2 ring-teal-500/20 shadow-md translate-y-[-4px]' 
                    : 'bg-white/40 border-white/60'
                }`}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2 bg-white/60 backdrop-blur rounded-xl shadow-sm border border-white/60 p-1">
                      <button 
                        onClick={() => startEdit(team)} 
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          editingTeamId === team._id 
                            ? 'text-teal-700 bg-white shadow-sm' 
                            : 'text-teal-600 hover:bg-white/80'
                        }`}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteTeam(team._id)} className="text-red-500 hover:bg-white/80 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all">Delete</button>
                    </div>
                  </div>

                  <div className="mb-4 pt-2">
                    <h3 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-teal-700 transition-colors tracking-tight">{team.name}</h3>
                    <p className="text-sm text-gray-500 font-medium h-10 overflow-hidden line-clamp-2">{team.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="border-t border-white/40 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest pl-1">Members</p>
                      <span className="bg-teal-100/50 backdrop-blur text-teal-700 text-xs font-black px-2.5 py-1 rounded-full border border-teal-200 shadow-sm">{team.members.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(team.members || []).filter(m => m).slice(0, 5).map(m => (
                        <div key={m._id} className="flex items-center bg-white/60 backdrop-blur text-gray-700 text-[11px] font-black px-3 py-1.5 rounded-xl border border-white/60 shadow-sm" title={m.name}>
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-[9px] mr-2">
                            {m.name ? m.name.substring(0,1).toUpperCase() : ''}
                          </div>
                          {m.name ? m.name.split(' ')[0] : ''}
                        </div>
                      ))}
                      {(team.members || []).filter(m => m).length > 5 && (
                        <div className="flex items-center bg-white/60 backdrop-blur text-gray-600 text-[11px] font-black px-3 py-1.5 rounded-xl border border-white/60 shadow-sm">
                          +{(team.members || []).filter(m => m).length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
          })()}
        </div>
      </div>
    </div>
  );
}
