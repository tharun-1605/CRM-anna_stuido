import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

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

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Members</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create User Form */}
        <div className="app-card p-6">
          <h3 className="font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">Invite / Create Member</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email / User ID</label>
              <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Display Name</label>
              <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full app-input px-3 py-2 text-sm">
                <option value="Employee">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full app-input px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreateUser} className="app-btn-primary w-full py-2 text-sm mt-4">
              Add Member
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Reset Password */}
          <div className="app-card p-6">
            <h3 className="font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">Reset Member Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Member</label>
                <select value={resetUserId} onChange={(e) => setResetUserId(e.target.value)} className="w-full app-input px-3 py-2 text-sm">
                  <option value=""></option>
                  {(users || []).map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <button onClick={handleResetPassword} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 w-full py-2 rounded font-medium text-sm transition-colors">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 app-card p-6">
        <h3 className="font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">All Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map(u => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-gray-800 font-medium">
                    {editingUserId === u._id ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="app-input px-2 py-1 text-sm" />
                    ) : u.name}
                  </td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3 text-gray-600">
                    {editingUserId === u._id ? (
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="app-input px-2 py-1 text-sm">
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : u.role}
                  </td>
                  <td className="py-3 text-right">
                    {editingUserId === u._id ? (
                      <>
                        <button onClick={() => handleUpdateUser(u._id)} className="text-green-600 hover:text-green-800 font-medium mr-3">Save</button>
                        <button onClick={() => setEditingUserId(null)} className="text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditUser(u)} className="text-teal-600 hover:text-teal-800 font-medium mr-3">Edit</button>
                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </>
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
