import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Calendar, FolderKanban, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import useTimerStore from '../store/timerStore';

export default function UserDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const { 
    isTracking, 
    activeTask, 
    elapsed, 
    setActiveTask, 
    startTracking, 
    stopTracking 
  } = useTimerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          axios.get('/projects'),
          axios.get('/work/me')
        ]);
        setProjects(pRes.data);
        setTasks(tRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      }
    };
    fetchData();
  }, []);

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Tracker Widget */}
        <div className="app-card p-6 border-t-4 border-t-teal-500">
          <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
            <Play className="w-5 h-5 mr-2 text-teal-500" /> Time Tracker
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Select Assigned Task</label>
            <select 
              className="w-full app-input px-3 py-2 text-sm bg-gray-50"
              value={activeTask}
              onChange={(e) => setActiveTask(e.target.value)}
              disabled={isTracking}
            >
              <option value="">-- Choose Task --</option>
              {tasks.length === 0 && <option value="" disabled>No tasks assigned yet</option>}
              {tasks.map(t => (
                <option key={t._id} value={t._id}>{t.name} (Project: {t.project?.name})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-3xl font-mono font-bold text-gray-700">
              {formatTime(elapsed)}
            </div>
            <button 
              onClick={toggleTracking}
              className={`flex items-center px-6 py-3 rounded-md font-bold text-white transition-colors shadow-sm ${isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}
            >
              {isTracking ? (
                <><Square className="w-4 h-4 mr-2 fill-current" /> Stop Work</>
              ) : (
                <><Play className="w-4 h-4 mr-2 fill-current" /> Start Work</>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            {isTracking ? "A screenshot will be captured every 3 minutes." : "Select a task and click start to begin logging time."}
          </p>
        </div>

        {/* Assigned Projects */}
        <div className="app-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800">
            <FolderKanban className="w-5 h-5 mr-2 text-blue-500" /> My Projects
          </h2>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm">No projects assigned.</p>
            ) : (
              projects.map(p => (
                <div key={p._id} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center hover:shadow-sm transition-shadow cursor-pointer">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{p.name}</h4>
                    {p.customer && <p className="text-xs text-gray-500">{p.customer}</p>}
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Assigned</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
