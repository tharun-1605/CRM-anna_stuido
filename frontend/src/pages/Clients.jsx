import React from 'react';
import { Plus } from 'lucide-react';

export default function Clients() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <button className="app-btn-primary px-4 py-2 flex items-center text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </button>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
           <div className="w-32">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Type</label>
              <div className="flex bg-gray-100 rounded p-1">
                <button className="px-3 py-1 text-xs bg-teal-500 shadow-sm rounded text-white font-medium">Active</button>
                <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 rounded font-medium">Archived</button>
              </div>
           </div>
           <div className="flex-1">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Search client</label>
              <input type="text" placeholder="Search by client info..." className="app-input w-full px-3 py-1.5 text-xs" />
           </div>
           <div className="w-48">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">Portal Access</label>
              <select className="app-input w-full px-2 py-1.5 text-xs"><option>(All)</option></select>
           </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#F9FAFB]">
          <svg className="w-40 h-40 mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="70" width="80" height="50" rx="8" fill="#1e293b" opacity="0.1"/>
            <rect x="60" y="80" width="80" height="50" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
            <line x1="75" y1="95" x2="105" y2="95" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <rect x="65" y="90" width="3" height="15" fill="#f97316"/>
          </svg>
          <h2 className="text-gray-700 font-bold text-lg">No active clients found.</h2>
        </div>
      </div>
    </div>
  );
}
