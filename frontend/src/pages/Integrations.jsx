import React, { useState } from 'react';
import { Blocks, CheckCircle2, ChevronRight, Search, Activity, Calendar as CalendarIcon, MessageSquare, Briefcase, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    icon: MessageSquare,
    color: 'bg-[#4A154B]',
    description: 'Send automatic notifications to Slack channels when tasks are completed or time is logged.',
    connected: true,
  },
  {
    id: 'jira',
    name: 'Jira Software',
    category: 'Project Management',
    icon: Briefcase,
    color: 'bg-[#0052CC]',
    description: 'Sync your Jira epics and issues automatically with WorkforcePro projects and tasks.',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    icon: Blocks,
    color: 'bg-[#24292e]',
    description: 'Link pull requests and commits to your tracked time and task assignments.',
    connected: false,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'Accounting',
    icon: FileSpreadsheet,
    color: 'bg-[#2CA01C]',
    description: 'Export timesheets and payroll data directly into QuickBooks for seamless billing.',
    connected: false,
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    category: 'Productivity',
    icon: CalendarIcon,
    color: 'bg-[#4285F4]',
    description: 'Sync approved leave requests and scheduled shifts directly to your team members calendars.',
    connected: true,
  }
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(MOCK_INTEGRATIONS.map(i => i.category))];

  const handleToggleConnect = (id, currentStatus) => {
    // In a real app, this would hit an API endpoint to OAuth authorize or disconnect
    if (!currentStatus) {
      toast.success(`Redirecting to authentication...`);
      setTimeout(() => {
        setIntegrations(integrations.map(i => i.id === id ? { ...i, connected: true } : i));
        toast.success(`Successfully connected integration!`);
      }, 1000);
    } else {
      if(window.confirm('Are you sure you want to disconnect this integration?')) {
        setIntegrations(integrations.map(i => i.id === id ? { ...i, connected: false } : i));
        toast.success(`Integration disconnected.`);
      }
    }
  };

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || i.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 animate-fade-in-up gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight flex items-center">
            <Blocks className="w-8 h-8 mr-3 text-teal-500" />
            Integrations Hub
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Connect WorkforcePro with your favorite third-party tools.</p>
        </div>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-50"></div>
        
        {/* Top Controls */}
        <div className="border-b border-gray-100/80 bg-white/50 px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
           <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
             {categories.map(cat => (
               <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === cat ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600'}`}
               >
                 {cat}
               </button>
             ))}
           </div>
           
           <div className="relative w-full sm:w-72">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-gray-400" />
             </div>
             <input 
               type="text" 
               placeholder="Search integrations..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 sm:text-sm transition-all shadow-sm" 
             />
           </div>
        </div>
        
        {/* Integrations Grid */}
        <div className="flex-1 overflow-auto bg-gray-50/30 backdrop-blur-sm p-8 relative z-10 custom-scrollbar">
          {filteredIntegrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-gray-600 font-extrabold text-xl mb-2">No integrations found</h2>
              <p className="text-gray-400 font-medium text-sm">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div key={integration.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden flex flex-col h-full">
                    {/* Status indicator line at top */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${integration.connected ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'}`}></div>
                    
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${integration.color} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      {integration.connected && (
                        <span className="flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-emerald-100 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          CONNECTED
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{integration.name}</h3>
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{integration.category}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 font-medium mb-6 flex-1">
                      {integration.description}
                    </p>
                    
                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <button 
                        onClick={() => handleToggleConnect(integration.id, integration.connected)}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                          integration.connected 
                            ? 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-200 hover:text-red-600' 
                            : 'bg-teal-50 text-teal-700 hover:bg-teal-500 hover:text-white border-2 border-transparent'
                        }`}
                      >
                        {integration.connected ? 'Manage Settings' : 'Connect'}
                        {!integration.connected && <ChevronRight className="w-4 h-4 ml-1" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
