const fs = require('fs');

function fixFile(file, stringToRemove) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(stringToRemove, '');
  fs.writeFileSync(file, content);
}

fixFile('frontend/src/pages/Projects.jsx', `
                      <td className="py-3 text-gray-600">{p.client?.name || '-'}</td>
                      <td className="py-3 text-center">
                        <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded border border-teal-200">{p.status}</span>
                      </td>`);

fixFile('frontend/src/pages/AssignWork.jsx', `
                      <td className="py-3 text-gray-600">{a.user?.name}</td>
                      <td className="py-3 text-center text-gray-600">
                        {editingId === a._id ? <input type="number" value={editData.estimatedHours} onChange={e=>setEditData({...editData, estimatedHours: e.target.value})} className="app-input px-2 py-1 text-sm w-16"/> : a.estimatedHours}
                      </td>
                      <td className="py-3 text-center font-semibold text-teal-600">{a.timeSpent.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{a.status}</span>
                      </td>`);

console.log('Fixed syntax in Projects and AssignWork');
