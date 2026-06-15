const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Projects.jsx', 'utf8');

const handleDelete = `
  const handleDelete = async (id) => {
    if(!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(\`/projects/\${id}\`);
      toast.success('Project deleted');
      fetchProjects();
    } catch(err) { toast.error('Failed to delete project'); }
  };
`;

const handleEdit = `
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });
  
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditData({ name: p.name, description: p.description || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(\`/projects/\${id}\`, editData);
      toast.success('Project updated');
      setEditingId(null);
      fetchProjects();
    } catch(err) { toast.error('Failed to update project'); }
  };
`;

content = content.replace("const handleCreate", handleDelete + "\n" + handleEdit + "\n  const handleCreate");

content = content.replace('<th className="pb-3 font-semibold text-center">Status</th>', '<th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>');

const rowContent = `
                      <td className="py-3 text-gray-800 font-medium">
                        {editingId === p._id ? <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-2 py-1 text-sm"/> : p.name}
                      </td>
                      <td className="py-3 text-gray-600">
                        {editingId === p._id ? <input type="text" value={editData.description} onChange={e=>setEditData({...editData, description: e.target.value})} className="app-input px-2 py-1 text-sm"/> : (p.description || '-')}
                      </td>
                      <td className="py-3 text-gray-600">{p.client?.name || '-'}</td>
                      <td className="py-3 text-center">
                        <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded border border-teal-200">{p.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        {editingId === p._id ? (
                          <>
                            <button onClick={() => handleUpdate(p._id)} className="text-green-600 font-medium mr-3">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)} className="text-teal-600 font-medium mr-3">Edit</button>
                            <button onClick={() => handleDelete(p._id)} className="text-red-500 font-medium">Delete</button>
                          </>
                        )}
                      </td>
`;

content = content.replace(/<td className="py-3 text-gray-800 font-medium">\{p\.name\}<\/td>[\s\S]*?<\/td>/, rowContent);

fs.writeFileSync('frontend/src/pages/Projects.jsx', content);
console.log('Patched Projects.jsx');
