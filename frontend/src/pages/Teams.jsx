import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', members: [] });

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

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const members = prev.members.includes(userId) 
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="app-btn-primary px-4 py-2 flex items-center text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Team
        </button>
      </div>

      {isFormOpen && (
        <div className="app-card p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Create New Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Team Name *</label>
                <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full app-input px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="w-full app-input px-3 py-2 text-sm" rows="3" />
              </div>
              <button onClick={handleCreate} className="app-btn-primary px-4 py-2 text-sm w-full">Save Team</button>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Members</label>
              <div className="h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 space-y-2">
                {users.map(u => (
                  <label key={u._id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer bg-white p-2 rounded border border-gray-100 hover:border-teal-300">
                    <input 
                      type="checkbox" 
                      checked={formData.members.includes(u._id)}
                      onChange={() => handleMemberToggle(u._id)}
                      className="rounded text-teal-500 focus:ring-teal-500" 
                    />
                    <span>{u.name} ({u.email})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="app-card flex-1 overflow-hidden flex flex-col p-4">
        <div className="mb-6">
          <label className="block text-[11px] text-gray-500 font-medium mb-1">Search team</label>
          <div className="relative w-72">
             <input type="text" placeholder="Search by team & member name..." className="app-input w-full pl-3 pr-10 py-2 text-sm" />
          </div>
        </div>
        
        <div className={`flex-1 overflow-auto ${teams.length === 0 ? 'flex flex-col items-center justify-center border border-gray-100 rounded-lg bg-white' : ''}`}>
          {teams.length === 0 ? (
            <>
              <svg className="w-40 h-40 mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="70" width="80" height="50" rx="8" fill="#1e293b" opacity="0.1"/>
                <rect x="60" y="80" width="80" height="50" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
                <line x1="75" y1="95" x2="105" y2="95" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
                <rect x="65" y="90" width="3" height="15" fill="#f97316"/>
              </svg>
              <h2 className="text-gray-700 font-bold text-lg">No teams found.</h2>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teams.map(team => (
                <div key={team._id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{team.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 h-8 overflow-hidden">{team.description}</p>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">Members ({team.members.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {team.members.map(m => (
                        <span key={m._id} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-100">
                          {m.name}
                        </span>
                      ))}
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
