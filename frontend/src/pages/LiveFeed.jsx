import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Monitor, User, Clock, AlertCircle, X, Activity } from 'lucide-react';

export default function LiveFeed() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const fetchLiveFeed = async () => {
      try {
        const { data } = await axios.get('/live');
        setActiveUsers(data);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveFeed();
    // Poll every 5 seconds
    const interval = setInterval(fetchLiveFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      {/* Header section with gradient */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 animate-fade-in-up gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
            <Monitor className="w-8 h-8 mr-3 text-teal-500" /> 
            Live Monitor
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Real-time view of currently active users. Screens update automatically every 5 seconds.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full border border-red-100 shadow-sm">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
           </span>
           <span className="text-sm font-bold text-red-700 tracking-wide uppercase">Live</span>
        </div>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        <div className="flex-1 overflow-auto bg-gray-50/30 backdrop-blur-sm p-6 relative z-10 custom-scrollbar">
          {loading && activeUsers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-gray-500 font-bold">Connecting to live feed...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-extrabold text-red-600 mb-2">Connection Error</h3>
              <p className="text-sm font-medium text-red-400">Unable to connect to live feed. Retrying...</p>
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Monitor className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-600 mb-2 tracking-tight">No Active Users</h3>
              <p className="text-gray-400 font-medium">No one is currently tracking time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeUsers.map((data) => (
                <div key={data.user._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 flex items-center justify-center font-extrabold text-sm shadow-sm border border-teal-100">
                        {data.user.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-800 text-sm leading-tight mb-0.5">{data.user.name}</h4>
                        <span className="text-[10px] text-gray-400 font-bold tracking-wide uppercase flex items-center">
                           <Clock className="w-3 h-3 mr-1" />
                           {new Date(data.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
                      <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  
                  <div 
                    className="relative bg-gray-900 aspect-video group-hover:bg-black cursor-pointer overflow-hidden"
                    onClick={() => setFullscreenImage({ url: data.frame, name: data.user.name })}
                  >
                    <img 
                      src={data.frame} 
                      alt={`${data.user.name}'s screen`}
                      className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300 shadow-lg flex items-center">
                        <Monitor className="w-4 h-4 mr-2" /> Expand Screen
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm transition-all"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <button 
              className="absolute top-6 right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors backdrop-blur-md z-10"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute top-6 left-6 text-white bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center shadow-2xl z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-ping absolute"></div>
              <div className="w-2 h-2 rounded-full bg-red-500 mr-3 relative z-10"></div>
              <span className="font-extrabold text-sm tracking-wide">{fullscreenImage.name}'s Screen</span>
            </div>
            <img 
              src={fullscreenImage.url} 
              alt="Fullscreen view" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
