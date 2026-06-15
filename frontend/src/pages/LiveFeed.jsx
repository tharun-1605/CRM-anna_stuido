import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Monitor, User, Clock, AlertCircle } from 'lucide-react';

export default function LiveFeed() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
              
              <div className="relative bg-black aspect-video group">
                <img 
                  src={data.frame} 
                  alt={`${data.user.name}'s screen`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
