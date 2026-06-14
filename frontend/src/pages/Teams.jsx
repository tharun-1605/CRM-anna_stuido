import React from 'react';
import { Plus } from 'lucide-react';

export default function Teams() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        <button className="app-btn-primary px-4 py-2 flex items-center text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Team
        </button>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col p-4">
        <div className="mb-6">
          <label className="block text-[11px] text-gray-500 font-medium mb-1">Search team (No records found)</label>
          <div className="relative w-72">
             <input type="text" placeholder="Search by team & member name..." className="app-input w-full pl-3 pr-10 py-2 text-sm" />
             <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button className="bg-teal-500 text-white p-1.5 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
             </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center border border-gray-100 rounded-lg bg-white">
          <svg className="w-40 h-40 mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="70" width="80" height="50" rx="8" fill="#1e293b" opacity="0.1"/>
            <rect x="60" y="80" width="80" height="50" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2"/>
            <line x1="75" y1="95" x2="105" y2="95" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
            <rect x="65" y="90" width="3" height="15" fill="#f97316"/>
          </svg>
          <h2 className="text-gray-700 font-bold text-lg">No teams found.</h2>
        </div>
      </div>
    </div>
  );
}
