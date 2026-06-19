import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, X, CalendarDays } from 'lucide-react';

// Timezone-agnostic date parser to prevent day-shifts on calendar
const parseDateAgnostic = (dateInput) => {
  if (!dateInput) return null;
  try {
    const dateStr = typeof dateInput === 'string' ? dateInput.split('T')[0] : new Date(dateInput).toISOString().split('T')[0];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(dateInput);
    const [year, month, day] = parts.map(Number);
    // Return local Date set to noon to avoid timezone shifts
    return new Date(year, month - 1, day, 12, 0, 0);
  } catch (e) {
    return new Date(dateInput);
  }
};

export default function MasterCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        axios.get('/projects'),
        axios.get('/auth/users')
      ]);
      setProjects(projRes.data);
      setUsers(userRes.data);
    } catch (err) {
      toast.error('Failed to load calendar data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Update crew member / cameraMan
  const handleUpdateCameraMan = async (project, eventId, newCameraMan) => {
    try {
      let updatedEvents;
      if (eventId && eventId !== project._id) {
        // Update existing event
        updatedEvents = project.events.map(ev => {
          if (ev._id === eventId) {
            return { ...ev, cameraMan: newCameraMan };
          }
          return ev;
        });
      } else {
        // Create an event for the project start/end date
        const newEvent = {
          date: project.startDate || new Date(),
          eventType: 'Shoot',
          cameraMan: newCameraMan,
          location: project.location || ''
        };
        updatedEvents = [...(project.events || []), newEvent];
      }

      const res = await axios.put(`/projects/${project._id}`, {
        events: updatedEvents
      });

      // Update state
      setProjects(prevProjects =>
        prevProjects.map(p => p._id === project._id ? res.data : p)
      );

      toast.success('Crew member updated');
    } catch (err) {
      toast.error('Failed to update crew member');
    }
  };

  // Extract all shoots and dates
  const allShoots = [];
  projects.forEach(p => {
    // 1. Add project start date as a key point
    if (p.startDate) {
      const parsedStart = parseDateAgnostic(p.startDate);
      if (parsedStart) {
        allShoots.push({
          date: parsedStart,
          title: p.name,
          type: 'Project Start',
          client: p.client?.name || p.customer || 'Unknown',
          status: p.status,
          project: p,
          details: p
        });
      }
    }

    // 2. Add project end date as a key point
    if (p.endDate) {
      const parsedEnd = parseDateAgnostic(p.endDate);
      if (parsedEnd) {
        allShoots.push({
          date: parsedEnd,
          title: p.name,
          type: 'Project End',
          client: p.client?.name || p.customer || 'Unknown',
          status: p.status,
          project: p,
          details: p
        });
      }
    }

    // 3. Add individual events
    if (p.events && p.events.length > 0) {
      p.events.forEach(ev => {
        if (ev.date) {
          const parsedEv = parseDateAgnostic(ev.date);
          if (parsedEv) {
            allShoots.push({
              date: parsedEv,
              title: p.name,
              type: ev.eventType || 'Shoot',
              client: p.client?.name || p.customer || 'Unknown',
              status: p.status,
              project: p,
              details: ev
            });
          }
        }
      });
    }
  });

  const getShootsForDay = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return allShoots.filter(s =>
      s.date.getFullYear() === targetDate.getFullYear() &&
      s.date.getMonth() === targetDate.getMonth() &&
      s.date.getDate() === targetDate.getDate()
    );
  };

  const openDayModal = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setIsModalOpen(true);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border border-gray-100/50 bg-gray-50/30 rounded-xl m-1"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayShoots = getShootsForDay(day);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

    // Deduplicate same-project shoots on the same day for overview grid display
    const uniqueShoots = [];
    const seen = new Set();
    dayShoots.forEach(s => {
      const key = `${s.project._id}-${s.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueShoots.push(s);
      }
    });

    days.push(
      <div
        key={day}
        onClick={() => openDayModal(day)}
        className={`h-32 border ${isToday ? 'border-teal-400 bg-teal-50/30' : 'border-gray-200 bg-white/40'} rounded-xl m-1 p-2 flex flex-col hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden backdrop-blur-md`}
      >
        <span className={`text-sm font-extrabold ${isToday ? 'text-teal-600 bg-teal-100 w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-500'} mb-2`}>{day}</span>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {uniqueShoots.map((shoot, i) => (
            <div key={i} className={`text-[10px] px-2 py-1 rounded-md font-bold truncate ${shoot.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {shoot.title} <span className="text-[8px] opacity-75">({shoot.type})</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedDayShoots = selectedDate ? allShoots.filter(s =>
    s.date.getFullYear() === selectedDate.getFullYear() &&
    s.date.getMonth() === selectedDate.getMonth() &&
    s.date.getDate() === selectedDate.getDate()
  ) : [];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6 py-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 tracking-tight">Master Calendar</h1>
        <div className="flex space-x-4 items-center bg-white/60 backdrop-blur border border-white/50 p-2 rounded-2xl shadow-sm">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
          <span className="font-extrabold text-gray-800 text-lg min-w-[140px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="app-card flex-1 overflow-hidden flex flex-col animate-fade-in-up animate-stagger-1 relative bg-white/40">
        <div className="grid grid-cols-7 gap-1 px-4 py-3 bg-white/50 border-b border-white/60 backdrop-blur-md">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[11px] font-black uppercase text-gray-400 tracking-widest">{day}</div>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>
      </div>

      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-white/60">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                Shoots & Events on {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-white hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-100"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
              {selectedDayShoots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><CalendarDays className="w-8 h-8 text-gray-400" /></div>
                  <p className="text-gray-500 font-bold">No shoots or events booked for this date.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedDayShoots.map((shoot, i) => {
                    const isEvent = shoot.details && shoot.details._id && shoot.details._id !== shoot.project._id;

                    return (
                      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${shoot.status === 'Completed' ? 'bg-emerald-400' : 'bg-indigo-500'}`}></div>
                        <div className="flex justify-between items-start mb-4 pl-3">
                          <div>
                            <h3 className="font-extrabold text-xl text-gray-800">{shoot.title}</h3>
                            <p className="text-sm font-bold text-gray-500 mt-0.5">{shoot.client} • <span className="text-indigo-600">{shoot.type}</span></p>
                          </div>
                          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                            {shoot.status || 'Upcoming'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pl-3">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Time & Location</p>
                            <p className="text-sm font-bold text-gray-700">{shoot.details?.startTime || '-'} to {shoot.details?.endTime || '-'}</p>
                            <p className="text-sm font-medium text-gray-600 mt-1 truncate">{shoot.details?.location || 'Location TBD'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Crew & Assignment</p>
                              <div className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <span>Crew Member:</span>
                                <select
                                  value={shoot.details?.cameraMan || ''}
                                  onChange={(e) => handleUpdateCameraMan(shoot.project, isEvent ? shoot.details._id : null, e.target.value)}
                                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="">Unassigned</option>
                                  {users.map(u => (
                                    <option key={u._id} value={u.name}>{u.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-gray-700 mt-2">Notes: <span className="font-medium text-gray-600">{shoot.details?.notes || '-'}</span></p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
