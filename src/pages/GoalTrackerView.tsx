import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, Award, Trash2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Goal } from '../types';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audio';

export const GoalTrackerView: React.FC = () => {
  const { showToast } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly' | 'semester'>('weekly');
  const [targetValue, setTargetValue] = useState(15);
  const [unit, setUnit] = useState('hours');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  const fetchGoals = async () => {
    try {
      const res = await api.getGoals();
      setGoals(res.goals || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createGoal({
        title,
        type,
        targetValue,
        unit,
        deadline
      });
      setGoals([res.goal, ...goals]);
      showToast('New academic goal created', 'success');
      setIsModalOpen(false);
      setTitle('');
    } catch (e) {
      showToast('Error creating goal', 'error');
    }
  };

  const handleIncrement = async (goal: Goal, delta: number) => {
    const newVal = Math.max(0, Math.min(goal.targetValue, goal.currentValue + delta));
    try {
      const res = await api.updateGoal(goal.id, { currentValue: newVal });
      setGoals(goals.map(g => g.id === goal.id ? res.goal : g));

      if (newVal >= goal.targetValue && !goal.completed) {
        soundFX.playComplete();
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 }
        });
        showToast(`🏆 Milestone reached! Badge Unlocked: ${goal.badge}`, 'success');
      }
    } catch (e) {
      showToast('Error updating goal', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
      showToast('Goal deleted', 'info');
    } catch (e) {
      showToast('Error removing goal', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            <span>Academic Goal &amp; Milestone Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Set daily, weekly, and semester milestones. Unlock prestige achievement badges as you progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Grid of Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          const isDone = percent >= 100;

          return (
            <div
              key={goal.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                isDone ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20' : 'border-slate-200/80 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-50 text-indigo-700 font-mono">
                    {goal.type}
                  </span>

                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {goal.title}
                </h3>

                {/* Progress bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-mono font-bold text-indigo-600">{percent}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Achievement Badge */}
                {goal.badge && (
                  <div className="mt-4 p-2.5 rounded-xl border border-slate-100 bg-slate-50/80 flex items-center gap-2">
                    <Award className={`w-4 h-4 shrink-0 ${isDone ? 'text-amber-500' : 'text-slate-400'}`} />
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Prestige Badge</span>
                      <span className={`font-semibold ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                        {goal.badge} {isDone ? '✓ (Unlocked)' : '(Locked)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Incremental Controls */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Deadline: {goal.deadline}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleIncrement(goal, -1)}
                    disabled={goal.currentValue <= 0}
                    className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-30"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleIncrement(goal, 1)}
                    disabled={isDone}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs disabled:opacity-30"
                  >
                    +1 {goal.unit}
                  </button>
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
              <h3 className="text-sm font-bold text-slate-900">Create Academic Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master 30 LeetCode Mediums"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="daily">Daily Target</option>
                    <option value="weekly">Weekly Target</option>
                    <option value="monthly">Monthly Target</option>
                    <option value="semester">Semester Milestone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    placeholder="hours / problems / chapters"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
