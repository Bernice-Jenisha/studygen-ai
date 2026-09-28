import React, { useState, useEffect } from 'react';
import { Flame, Plus, Check, Award, X } from 'lucide-react';
import { api } from '../services/api';
import { Habit } from '../types';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audio';

export const HabitTrackerView: React.FC = () => {
  const { showToast } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Academics');

  const today = new Date().toISOString().split('T')[0];

  // Generate last 28 days for the contribution calendar heatmap
  const daysList: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    daysList.push(d.toISOString().split('T')[0]);
  }

  const fetchHabits = async () => {
    try {
      const res = await api.getHabits();
      setHabits(res.habits || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleToday = async (habit: Habit, dateStr: string) => {
    try {
      const res = await api.toggleHabitDate(habit.id, dateStr);
      setHabits(habits.map(h => h.id === habit.id ? res.habit : h));

      const isCompletedNow = res.habit.completedDates.includes(dateStr);
      if (isCompletedNow) {
        soundFX.playCoin();
        showToast(`Habit marked complete! Streak: ${res.habit.currentStreak} days 🔥`, 'success');
      } else {
        showToast('Habit date unchecked', 'info');
      }
    } catch (e) {
      showToast('Error toggling habit', 'error');
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const res = await api.createHabit(newHabitName, newHabitCategory);
      setHabits([...habits, res.habit]);
      showToast('Habit created', 'success');
      setIsModalOpen(false);
      setNewHabitName('');
    } catch (e) {
      showToast('Error creating habit', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            <span>Habit Streak &amp; Consistency Heatmap</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            28-day contribution heatmap inspired by GitHub. Build unbroken streaks for coding, problem-solving, and lecture revision.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habit Cards */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const isDoneToday = habit.completedDates.includes(today);

          return (
            <div
              key={habit.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4"
            >
              {/* Habit Header & Streaks */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleToday(habit, today)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                      isDoneToday
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'border-slate-300 hover:border-indigo-500 text-transparent'
                    }`}
                    title="Mark complete for today"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {habit.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Category: {habit.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                    <Flame className="w-4 h-4" />
                    <span>Current: <strong className="font-mono">{habit.currentStreak} days</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Best: <strong className="font-mono">{habit.longestStreak} days</strong></span>
                  </div>
                </div>
              </div>

              {/* 28-Day Heatmap Grid */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>28 Days Heatmap History (Click square to toggle date)</span>
                  <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    <span>More</span>
                  </div>
                </div>

                <div className="grid grid-cols-14 sm:grid-cols-28 gap-1.5 py-1">
                  {daysList.map((dateStr) => {
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const isDateToday = dateStr === today;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleToggleToday(habit, dateStr)}
                        title={`${dateStr}: ${isCompleted ? 'Completed' : 'Missed'}`}
                        className={`aspect-square rounded-xs transition-transform hover:scale-125 focus:outline-none ${
                          isCompleted
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200/60'
                        } ${isDateToday ? 'ring-2 ring-indigo-500' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Consistency Habit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45 mins LeetCode Dynamic Programming"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Academics">Academics</option>
                  <option value="Technical">Coding &amp; Technical</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Health">Wellness &amp; Sleep</option>
                </select>
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
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
