import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, Search, Trash2, CheckSquare } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function ScreenshotViewer() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [screenshots, setScreenshots] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          axios.get('/auth/users'),
          axios.get('/projects')
        ]);
        setUsers(uRes.data);
        setProjects(pRes.data);
      } catch (err) {
        toast.error('Failed to load filters');
      }
    };
    fetchDropdowns();
    loadScreenshots();
  }, []);

  const loadScreenshots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedUser) params.user = selectedUser;
      if (selectedProject) params.project = selectedProject;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get('/screenshots', { params });
      setScreenshots(data);
      setSelectedIds([]); // reset selection when loading new data
    } catch (err) {
      toast.error('Failed to load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === screenshots.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(screenshots.map(s => s._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} screenshots?`)) return;

    try {
      await axios.post('/screenshots/bulk-delete', { ids: selectedIds });
      toast.success('Screenshots deleted');
      setScreenshots(prev => prev.filter(s => !selectedIds.includes(s._id)));
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to delete screenshots');
    }
  };

  const handleDownload = (screenshot) => {
    const link = document.createElement('a');
    link.href = screenshot.imageUrl;
    link.download = `screenshot_${screenshot.user?.name || 'user'}_${screenshot.timeCaptured.replace(':', '')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedScreenshots = screenshots.filter(s => selectedIds.includes(s._id));
    selectedScreenshots.forEach((s, index) => {
      setTimeout(() => handleDownload(s), index * 300);
    });
    toast.success(`Downloading ${selectedIds.length} screenshots`);
    setSelectedIds([]);
  };

  const handleDownloadAll = () => {
    if (screenshots.length === 0) return;
    screenshots.forEach((s, index) => {
      setTimeout(() => handleDownload(s), index * 300);
    });
    toast.success(`Downloading ${screenshots.length} screenshots`);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-teal-600">
          <ImageIcon className="w-6 h-6 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Screenshots</h2>
        </div>
        <div className="flex items-center space-x-3">
          {screenshots.length > 0 && (
            <button onClick={toggleAll} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm flex items-center transition-colors">
              <CheckSquare className="w-4 h-4 mr-2" /> 
              {selectedIds.length === screenshots.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm flex items-center transition-colors">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedIds.length})
            </button>
          )}
          {selectedIds.length > 0 && (
            <button onClick={handleDownloadSelected} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm flex items-center transition-colors">
              <Download className="w-4 h-4 mr-2" /> Download Selected ({selectedIds.length})
            </button>
          )}
          {selectedIds.length === 0 && (
            <button onClick={handleDownloadAll} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm flex items-center transition-colors">
              <Download className="w-4 h-4 mr-2" /> Download All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">User</label>
          <select value={selectedUser} onChange={(e)=>setSelectedUser(e.target.value)} className="w-full app-input px-3 py-2 text-sm bg-gray-50">
            <option value="">All Users</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project</label>
          <select value={selectedProject} onChange={(e)=>setSelectedProject(e.target.value)} className="w-full app-input px-3 py-2 text-sm bg-gray-50">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">From Date</label>
          <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full app-input px-3 py-2 text-sm bg-gray-50" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">To Date</label>
          <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full app-input px-3 py-2 text-sm bg-gray-50" />
        </div>
        <button onClick={loadScreenshots} className="app-btn-primary px-6 py-2 text-sm h-[38px] flex items-center">
          <Search className="w-4 h-4 mr-2" /> Filter
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : screenshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No Screenshots Found</h3>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {screenshots.map(s => (
              <div key={s._id} className="app-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="p-3 border-b border-gray-100 bg-white relative">
                  <div className="absolute top-2 right-2 z-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                      checked={selectedIds.includes(s._id)}
                      onChange={() => toggleSelection(s._id)}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2 pr-6">
                     <span className="font-semibold text-gray-800 text-sm truncate">{s.user?.name || 'Unknown User'}</span>
                     <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">{s.timeCaptured}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    <span className="font-medium text-teal-600">{s.project?.name || 'No Project'}</span> 
                    {s.workPackage && <span className="ml-1 text-gray-400">({s.workPackage.name})</span>}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(s.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div 
                  className={`relative bg-gray-100 aspect-video flex items-center justify-center cursor-pointer border-2 transition-colors ${selectedIds.includes(s._id) ? 'border-teal-500' : 'border-transparent'}`}
                  onClick={() => toggleSelection(s._id)}
                >
                  <img 
                    src={s.imageUrl} 
                    alt="Screenshot"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360?text=Image+Load+Error'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Download className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" onClick={(e) => { e.stopPropagation(); handleDownload(s); }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
