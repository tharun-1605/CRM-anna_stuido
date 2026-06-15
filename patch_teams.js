const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Teams.jsx', 'utf8');

const handleDelete = `
  const handleDeleteTeam = async (id) => {
    if(!window.confirm('Delete this team?')) return;
    try {
      await axios.delete(\`/teams/\${id}\`);
      toast.success('Team deleted');
      fetchTeams();
    } catch(err) { toast.error('Failed to delete team'); }
  };
`;

const handleEdit = `
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editName, setEditName] = useState('');
  
  const startEdit = (team) => {
    setEditingTeamId(team._id);
    setEditName(team.name);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(\`/teams/\${id}\`, { name: editName });
      toast.success('Team updated');
      setEditingTeamId(null);
      fetchTeams();
    } catch(err) { toast.error('Failed to update team'); }
  };
`;

content = content.replace("const handleCreateTeam", handleDelete + "\\n" + handleEdit + "\\n  const handleCreateTeam");

// add actions header
content = content.replace('<th className="pb-3 font-semibold">Members</th>', '<th className="pb-3 font-semibold">Members</th><th className="pb-3 font-semibold text-right">Actions</th>');

const teamRow = `
                  <td className="py-3 text-gray-800 font-medium">
                    {editingTeamId === team._id ? (
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="app-input px-2 py-1 text-sm" />
                    ) : team.name}
                  </td>
`;
content = content.replace('<td className="py-3 text-gray-800 font-medium">{team.name}</td>', teamRow);

const actionCell = `
                  <td className="py-3 text-gray-600">{team.members?.length || 0} users</td>
                  <td className="py-3 text-right">
                    {editingTeamId === team._id ? (
                      <>
                        <button onClick={() => handleUpdate(team._id)} className="text-green-600 hover:text-green-800 font-medium mr-3">Save</button>
                        <button onClick={() => setEditingTeamId(null)} className="text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(team)} className="text-teal-600 hover:text-teal-800 font-medium mr-3">Edit</button>
                        <button onClick={() => handleDeleteTeam(team._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </>
                    )}
                  </td>
`;
content = content.replace('<td className="py-3 text-gray-600">{team.members?.length || 0} users</td>', actionCell);

fs.writeFileSync('frontend/src/pages/Teams.jsx', content);
console.log('Patched Teams.jsx');
