import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, KeyRound, Users, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');
  const [newUserPassword, setNewUserPassword] = useState('');
  
  const [resetUserId, setResetUserId] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/auth/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUserId || !newUserName || !newUserPassword) return toast.error('Fill required fields');
    try {
      await axios.post('/auth/register', { 
        email: newUserId, 
        name: newUserName, 
        role: newUserRole,
        password: newUserPassword 
      });
      toast.success('User created successfully');
      fetchUsers();
      setNewUserId(''); setNewUserName(''); setNewUserPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating user');
    }
  };

  
  const handleDeleteUser = async (id) => {
    if(!window.confirm('Delete this member?')) return;
    try {
      await axios.delete(`/auth/users/${id}`);
      toast.success('Member deleted');
      fetchUsers();
    } catch(err) { toast.error('Failed to delete member'); }
  };

  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const startEditUser = (user) => {
    setEditingUserId(user._id);
    setEditName(user.name);
    setEditRole(user.role);
  };

  const handleUpdateUser = async (id) => {
    try {
      await axios.put(`/auth/users/${id}`, { name: editName, role: editRole });
      toast.success('Member updated');
      setEditingUserId(null);
      fetchUsers();
    } catch(err) { toast.error('Failed to update member'); }
  };
  const handleResetPassword = async () => {
    if (!resetUserId) return toast.error('Select a user');
    try {
      await axios.put(`/auth/users/${resetUserId}/reset-password`);
      toast.success('Password reset to default (password123)');
      setResetUserId('');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleExport = () => {
    const exportData = users.map(u => ({
      Name: u.name,
      Email: u.email,
      Role: u.role
    }));
    exportToCSV(exportData, 'Users_Export');
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col space-y-8 py-4">
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">
          Team Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create User Form */}
        <div className="app-card p-8 animate-fade-in-up animate-stagger-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center relative z-10">
            <UserPlus className="w-6 h-6 mr-3 text-teal-500" /> Invite / Create Member
          </h3>
          <div className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email / User ID</label>
              <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" placeholder="jane@company.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Display Name</label>
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" placeholder="Jane Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Role</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                  <option value="Employee">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Password</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm" placeholder="••••••••" />
              </div>
            </div>
            <button onClick={handleCreateUser} className="app-btn-primary w-full py-3 text-sm mt-4 shadow-lg hover:shadow-teal-500/25">
              Add Member
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Reset Password */}
          <div className="app-card p-8 animate-fade-in-up animate-stagger-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center relative z-10">
              <KeyRound className="w-6 h-6 mr-3 text-orange-500" /> Reset Password
            </h3>
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Select Member</label>
                <select value={resetUserId} onChange={(e) => setResetUserId(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm">
                  <option value="">-- Select --</option>
                  {(users || []).map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <button onClick={handleResetPassword} className="bg-gradient-to-r from-red-50 to-orange-50 text-red-600 hover:from-red-100 hover:to-orange-100 border border-red-200 w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 shadow-sm hover:shadow-red-500/10">
                Force Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card p-0 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-3 relative">
        <div className="p-6 border-b border-white/40 bg-white/30 backdrop-blur-md flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-xl flex items-center">
             <Users className="w-6 h-6 mr-3 text-indigo-500" /> Directory
          </h3>
          <button onClick={handleExport} className="bg-white/60 backdrop-blur border border-white/50 text-gray-700 hover:bg-white/80 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-gray-500 bg-white/30 border-b border-white/40 uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-5">Name</th>
                <th className="px-6 py-5">Email</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(users || []).map(u => (
                <tr key={u._id} className="hover:bg-white/40 transition-colors group">
                  <td className="px-6 py-4 text-gray-800 font-bold">
                    {editingUserId === u._id ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="app-input px-3 py-1.5 text-sm" />
                    ) : (
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                           {u.name.substring(0,2).toUpperCase()}
                         </div>
                         <span className="tracking-tight">{u.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-bold">{u.email}</td>
                  <td className="px-6 py-4">
                    {editingUserId === u._id ? (
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="app-input px-3 py-1.5 text-sm">
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm shadow-sm ${
                        u.role === 'Admin' ? 'bg-purple-100/50 text-purple-700 border border-purple-200' :
                        u.role === 'Manager' ? 'bg-blue-100/50 text-blue-700 border border-blue-200' :
                        'bg-white/60 text-gray-700 border border-white/60'
                      }`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingUserId === u._id ? (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleUpdateUser(u._id)} className="bg-emerald-100/50 backdrop-blur border border-emerald-200 text-emerald-700 hover:bg-emerald-200/50 px-3 py-1.5 rounded-lg font-bold text-xs transition-all">Save</button>
                        <button onClick={() => setEditingUserId(null)} className="bg-white/50 backdrop-blur border border-white/60 text-gray-700 hover:bg-white/80 px-3 py-1.5 rounded-lg font-bold text-xs transition-all">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditUser(u)} className="text-teal-600 hover:text-teal-800 font-bold text-sm transition-colors">Edit</button>
                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
