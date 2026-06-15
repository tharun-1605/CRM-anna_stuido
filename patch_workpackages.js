const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/WorkPackages.jsx', 'utf8');

const handleEdit = `
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  
  const startEdit = (t) => {
    setEditingId(t._id);
    setEditStatus(t.status);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(\`/work/\${id}\`, { status: editStatus });
      toast.success('Progress updated');
      setEditingId(null);
      fetchData();
    } catch(err) { toast.error('Failed to update progress'); }
  };
`;

content = content.replace("const filteredAssignments", handleEdit + "\n  const filteredAssignments");

content = content.replace('<th className="pb-3 font-semibold text-center">Status</th>', '<th className="pb-3 font-semibold text-center">Status</th><th className="pb-3 font-semibold text-right">Actions</th>');

const rowContent = `
                    <td className="py-3 text-gray-800 font-medium">{a.name}</td>
                    {user?.role === 'Admin' && <td className="py-3 text-gray-600 font-medium">{a.user?.name || 'Unknown'}</td>}
                    <td className="py-3 text-gray-600">{a.project?.name}</td>
                    <td className="py-3 text-center text-gray-600">{a.estimatedHours.toFixed(1)}</td>
                    <td className="py-3 text-center font-semibold text-teal-600">{a.timeSpent.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      {editingId === a._id ? (
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="app-input px-2 py-1 text-sm">
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{a.status}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {editingId === a._id ? (
                        <>
                          <button onClick={() => handleUpdate(a._id)} className="text-green-600 font-medium mr-3">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(a)} className="text-teal-600 font-medium">Update Progress</button>
                      )}
                    </td>
`;

content = content.replace(/<td className="py-3 text-gray-800 font-medium">\{a\.name\}<\/td>[\s\S]*?<\/td>/, rowContent);

fs.writeFileSync('frontend/src/pages/WorkPackages.jsx', content);
console.log('Patched WorkPackages.jsx');
