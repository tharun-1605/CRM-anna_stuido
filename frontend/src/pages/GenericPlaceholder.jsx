import React from 'react';

export default function GenericPlaceholder({ title, emptyMessage }) {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <button className="app-btn-primary px-4 py-2 flex items-center text-sm">
          + Add New
        </button>
      </div>

      <div className="app-card flex-1 flex flex-col items-center justify-center p-10">
        <svg className="w-32 h-32 mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 60L40 160H160L100 60Z" fill="#14b8a6"/>
          <path d="M100 60L70 110L100 130L130 110L100 60Z" fill="#ccfbf1"/>
          <circle cx="100" cy="50" r="10" fill="#fbbf24"/>
        </svg>
        <p className="text-gray-500 font-medium text-lg">{emptyMessage || `No ${title.toLowerCase()} found.`}</p>
        <p className="text-gray-400 mt-2 text-sm">This feature is currently under development.</p>
      </div>
    </div>
  );
}
