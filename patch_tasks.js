const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/AssignWork.jsx', 'utf8');

const handleDelete = `
  const handleDelete = async (id) => {
    if(!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(\`/work/\${id}\`);
      toast.success('Task deleted');
      fetchData();
    } catch(err) { toast.error('Failed to delete task'); }
  };
`;

const handleEdit = `
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', estimatedHours: 0 });
  
  const startEdit = (t) => {
    setEditingId(t._id);
    setEditData({ name: t.name, estimatedHours: t.estimatedHours || 0 });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(\`/work/\${id}\`, editData);
      toast.success('Task updated');
      setEditingId(null);
      fetchData();
    } catch(err) { toast.error('Failed to update task'); }
  };
`;

content = content.replace("const handleAssign", handleDelete + "\n" + handleEdit + "\n  const handleAssign");

content = content.replace('<th className="pb-3 font-semibold text-center">Status</th>', '<th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>');

const rowContent = `
                      <td className="py-3 text-gray-800 font-medium">
                        {editingId === a._id ? <input type="text" value={editData.name} onChange={e=>setEditData({...editData, name: e.target.value})} className="app-input px-2 py-1 text-sm"/> : a.name}
                      </td>
                      <td className="py-3 text-gray-600">{a.project?.name}</td>
                      <td className="py-3 text-gray-600">{a.user?.name}</td>
                      <td className="py-3 text-center text-gray-600">
                        {editingId === a._id ? <input type="number" value={editData.estimatedHours} onChange={e=>setEditData({...editData, estimatedHours: e.target.value})} className="app-input px-2 py-1 text-sm w-16"/> : a.estimatedHours}
                      </td>
                      <td className="py-3 text-center font-semibold text-teal-600">{a.timeSpent.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{a.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        {editingId === a._id ? (
                          <>
                            <button onClick={() => handleUpdate(a._id)} className="text-green-600 font-medium mr-3">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(a)} className="text-teal-600 font-medium mr-3">Edit</button>
                            <button onClick={() => handleDelete(a._id)} className="text-red-500 font-medium">Delete</button>
                          </>
                        )}
                      </td>
`;

content = content.replace(/<td className="py-3 text-gray-800 font-medium">\{a\.name\}<\/td>[\s\S]*?<\/td>/, rowContent);

fs.writeFileSync('frontend/src/pages/AssignWork.jsx', content);
console.log('Patched AssignWork.jsx');
