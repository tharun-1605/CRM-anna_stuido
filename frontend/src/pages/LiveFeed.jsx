import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Monitor, User, Clock, AlertCircle, X } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Monitor className="w-6 h-6 mr-3 text-teal-500" /> Live Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time view of currently active users. Screens update automatically every 10 seconds.
          </p>
        </div>
        <div className="flex items-center space-x-2">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
           </span>
           <span className="text-sm font-semibold text-gray-600">Live</span>
        </div>
      </div>

      {loading && activeUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-lg p-6">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-bold">Connection Error</h3>
          <p className="text-sm">Unable to connect to live feed. Retrying...</p>
        </div>
      ) : activeUsers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center app-card p-12 text-gray-400">
          <Monitor className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-500 mb-2">No Active Users</h3>
          <p className="text-sm">No one is currently tracking time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUsers.map((data) => (
            <div key={data.user._id} className="app-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                    {data.user.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight">{data.user.name}</h4>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center">
                       <Clock className="w-3 h-3 mr-1" />
                       Updated {new Date(data.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div 
                className="relative bg-black aspect-video group cursor-pointer"
                onClick={() => setFullscreenImage({ url: data.frame, name: data.user.name })}
              >
                <img 
                  src={data.frame} 
                  alt={`${data.user.name}'s screen`}
                  className="w-full h-full object-contain transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="bg-black/50 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to expand
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <p className="absolute top-4 left-4 text-white font-bold text-xl bg-black/50 px-4 py-2 rounded">
              {fullscreenImage.name}'s Screen
            </p>
            <img 
              src={fullscreenImage.url} 
              alt="Fullscreen view" 
              className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
