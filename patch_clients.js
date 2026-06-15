const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Clients.jsx', 'utf8');

const handleDelete = `
  const handleDelete = async (id) => {
    if(!window.confirm('Delete this client?')) return;
    try {
      await axios.delete(\`/clients/\${id}\`);
      toast.success('Client deleted');
      fetchClients();
    } catch(err) { toast.error('Failed to delete client'); }
  };
`;

const handleEdit = `
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', company: '', email: '' });
  
  const startEdit = (c) => {
    setEditingId(c._id);
    setEditData({ name: c.name, company: c.company || '', email: c.email || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(\`/clients/\${id}\`, editData);
      toast.success('Client updated');
      setEditingId(null);
      fetchClients();
    } catch(err) { toast.error('Failed to update client'); }
  };
`;

content = content.replace("const handleCreate", handleDelete + "\n" + handleEdit + "\n  const handleCreate");

content = content.replace('<th className="pb-3 font-semibold text-center">Status</th>', '<th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>');

const rowContent = `
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
`;

content = content.replace(/<td className="py-3 text-gray-800 font-medium">\{c\.name\}<\/td>[\s\S]*?<\/td>/, rowContent);

fs.writeFileSync('frontend/src/pages/Clients.jsx', content);
console.log('Patched Clients.jsx');
