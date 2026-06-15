const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/AdminPanel.jsx', 'utf8');

const handleDeleteUser = `
  const handleDeleteUser = async (id) => {
    if(!window.confirm('Delete this member?')) return;
    try {
      await axios.delete(\`/auth/users/\${id}\`);
      toast.success('Member deleted');
      fetchUsers();
    } catch(err) { toast.error('Failed to delete member'); }
  };
`;

const handleEditUser = `
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
      await axios.put(\`/auth/users/\${id}\`, { name: editName, role: editRole });
      toast.success('Member updated');
      setEditingUserId(null);
      fetchUsers();
    } catch(err) { toast.error('Failed to update member'); }
  };
`;

content = content.replace("const handleResetPassword", handleDeleteUser + "\\n" + handleEditUser + "\\n  const handleResetPassword");

const tableHTML = `
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
`;

content = content.replace("</div>\n    </div>", "</div>\n" + tableHTML + "\n    </div>");

fs.writeFileSync('frontend/src/pages/AdminPanel.jsx', content);
console.log('Patched AdminPanel.jsx');
