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
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 animate-fade-in-up gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
            <ImageIcon className="w-8 h-8 mr-3 text-teal-500" /> 
            Screenshot Viewer
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Review team activity snapshots and verify tracked work</p>
        </div>
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {screenshots.length > 0 && (
            <button onClick={toggleAll} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm">
              <CheckSquare className="w-4 h-4 mr-2" /> 
              {selectedIds.length === screenshots.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border-2 border-red-200 hover:border-transparent px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all shadow-sm">
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length})
            </button>
          )}
          {selectedIds.length > 0 && (
            <button onClick={handleDownloadSelected} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all shadow-lg hover:shadow-teal-500/30">
              <Download className="w-4 h-4 mr-2" /> Download ({selectedIds.length})
            </button>
          )}
          {selectedIds.length === 0 && (
            <button onClick={handleDownloadAll} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all shadow-lg hover:shadow-teal-500/30">
              <Download className="w-4 h-4 mr-2" /> Download All
            </button>
          )}
        </div>
      </div>

      <div className="app-card p-6 flex flex-wrap items-end gap-5 animate-fade-in-up relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="flex-1 min-w-[150px] relative z-10">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">User</label>
          <select value={selectedUser} onChange={(e)=>setSelectedUser(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm font-medium">
            <option value="">All Users</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] relative z-10">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Project</label>
          <select value={selectedProject} onChange={(e)=>setSelectedProject(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm font-medium">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] relative z-10">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">From Date</label>
          <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm font-medium" />
        </div>
        <div className="flex-1 min-w-[150px] relative z-10">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">To Date</label>
          <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full app-input px-4 py-2.5 text-sm font-medium" />
        </div>
        <button onClick={loadScreenshots} className="app-btn-primary px-6 py-2.5 text-sm font-bold flex items-center shadow-md relative z-10">
          <Search className="w-4 h-4 mr-2" /> Filter Results
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/50 rounded-2xl p-2 animate-fade-in-up animate-stagger-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-bold">Loading screenshots...</p>
          </div>
        ) : screenshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-500 mb-2 tracking-tight">No Screenshots Found</h3>
            <p className="text-gray-400 font-medium">Try adjusting your filters or selecting a different date range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
            {screenshots.map(s => (
              <div key={s._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative">
                <div className="p-4 border-b border-gray-50 relative">
                  <div className="absolute top-3 right-3 z-10">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500 cursor-pointer relative z-10 transition-transform hover:scale-110"
                        checked={selectedIds.includes(s._id)}
                        onChange={() => toggleSelection(s._id)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mb-3 pr-8">
                     <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-xs mr-3 border border-teal-100 shrink-0">
                       {s.user?.name ? s.user.name.substring(0,2).toUpperCase() : '?'}
                     </div>
                     <div className="min-w-0">
                       <h4 className="font-extrabold text-gray-800 text-sm truncate leading-tight">{s.user?.name || 'Unknown User'}</h4>
                       <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider mt-0.5 inline-block border border-gray-100">
                         {s.timeCaptured}
                       </span>
                     </div>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate font-medium">
                    <span className="font-bold text-teal-600">{s.project?.name || 'No Project'}</span> 
                    {s.workPackage && <span className="ml-1 text-gray-400">({s.workPackage.name})</span>}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">
                    {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div 
                  className={`relative bg-gray-900 aspect-video flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${selectedIds.includes(s._id) ? 'ring-4 ring-teal-500 ring-inset' : ''}`}
                  onClick={() => toggleSelection(s._id)}
                >
                  <img 
                    src={s.imageUrl} 
                    alt="Screenshot"
                    className={`w-full h-full object-cover transition-all duration-500 ${selectedIds.includes(s._id) ? 'opacity-70 scale-105' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'}`}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360?text=Image+Load+Error'; }}
                  />
                  <div className={`absolute inset-0 transition-colors duration-300 flex items-center justify-center ${selectedIds.includes(s._id) ? 'bg-teal-500/20' : 'bg-black/0 group-hover:bg-black/30'}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownload(s); }}
                      className="bg-white/90 text-gray-900 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 shadow-lg hover:scale-110 hover:bg-white"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedIds.includes(s._id) && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="bg-teal-500 text-white rounded-full p-2 shadow-lg scale-150 opacity-90">
                        <CheckSquare className="w-8 h-8" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
