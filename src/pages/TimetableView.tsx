import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Clock, MapPin, X } from 'lucide-react';
import { api } from '../services/api';
import { TimetableSession } from '../types';
import { useAuth } from '../context/AuthContext';

export const TimetableView: React.FC = () => {
  const { showToast } = useAuth();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Web Technologies');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState('#6366F1');
  const [room, setRoom] = useState('Hall 304');

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
    { num: 0, name: 'Sunday' },
  ];

  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#06B6D4'];

  const fetchTimetable = async () => {
    try {
      const res = await api.getTimetable();
      setSessions(res.timetable || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTimetableSession({
        title,
        subject,
        dayOfWeek,
        startTime,
        endTime,
        color,
        room
      });
      showToast('Timetable session added', 'success');
      setIsModalOpen(false);
      setTitle('');
      fetchTimetable();
    } catch (err: any) {
      showToast(err.message || 'Failed to add session', 'error');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.deleteTimetableSession(id);
      showToast('Session removed', 'info');
      setSessions(sessions.filter(s => s.id !== id));
    } catch (e) {
      showToast('Error removing session', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            <span>Smart Academic Timetable</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Interactive weekly timetable. Color-coded subjects with lecture room tags and AI schedule sync.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Session</span>
        </button>
      </div>

      {/* Weekly Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const daySessions = sessions
            .filter((s) => s.dayOfWeek === day.num)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={day.num}
              className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex flex-col min-h-[380px]"
            >
              {/* Day header */}
              <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{day.name}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {daySessions.length} {daySessions.length === 1 ? 'slot' : 'slots'}
                </span>
              </div>

              {/* Day Sessions List */}
              <div className="space-y-2 flex-1">
                {daySessions.length > 0 ? (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-2.5 rounded-lg border border-slate-100 relative group transition-all hover:shadow-xs"
                      style={{ borderLeftColor: session.color, borderLeftWidth: '4px' }}
                    >
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-xs font-bold text-slate-900 pr-5 truncate">
                        {session.title}
                      </div>

                      <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                        {session.subject}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {session.startTime} - {session.endTime}
                        </span>
                        {session.room && (
                          <span className="flex items-center gap-0.5 truncate max-w-[70px]">
                            <MapPin className="w-2.5 h-2.5" />
                            {session.room}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic py-8">
                    No sessions
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Study / Class Session</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {days.map((d) => (
                      <option key={d.num} value={d.num}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Venue (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 304 / Self Study"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Color Tag</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-slate-800' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
