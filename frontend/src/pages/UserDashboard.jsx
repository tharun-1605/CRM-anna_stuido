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
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between mb-4 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">
          My Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Time Tracker Widget */}
        <div className="app-card p-8 border-t-4 border-t-teal-500 animate-fade-in-up animate-stagger-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800 relative z-10">
            <Play className="w-6 h-6 mr-3 text-teal-500" /> Time Tracker
          </h2>
          
          <div className="mb-6 relative z-10">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Select Assigned Task</label>
            <select 
              className="w-full app-input px-4 py-3 text-sm bg-gray-50 hover:bg-white transition-colors cursor-pointer"
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

          <div className="flex items-center justify-between mt-8 relative z-10">
            <div className="text-4xl font-mono font-black tracking-tighter text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 shadow-inner">
              {formatTime(elapsed)}
            </div>
            <button 
              onClick={toggleTracking}
              className={`flex items-center px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${
                isTracking 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-red-500/25' 
                  : 'bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 hover:shadow-teal-500/25'
              }`}
            >
              {isTracking ? (
                <><Square className="w-5 h-5 mr-2 fill-current" /> Stop Work</>
              ) : (
                <><Play className="w-5 h-5 mr-2 fill-current" /> Start Work</>
              )}
            </button>
          </div>
          <p className="text-xs font-medium text-gray-400 mt-6 text-center relative z-10">
            {isTracking ? "Tracking actively. Screenshots are captured every 3 mins." : "Select a task and click start to begin logging time."}
          </p>
        </div>

        {/* Assigned Projects */}
        <div className="app-card p-8 animate-fade-in-up animate-stagger-2 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none"></div>

          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800 relative z-10">
            <FolderKanban className="w-6 h-6 mr-3 text-blue-500" /> My Projects
          </h2>
          <div className="space-y-4 relative z-10">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-xl border border-gray-100/50">
                <FolderKanban className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">No projects assigned.</p>
              </div>
            ) : (
              projects.map(p => (
                <div key={p._id} className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-md hover:bg-white transition-all cursor-pointer group">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{p.name}</h4>
                    {p.customer && <p className="text-xs text-gray-500 font-medium mt-1">{p.customer}</p>}
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100">Assigned</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
