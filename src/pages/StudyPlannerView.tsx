import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, BookOpen, CheckCircle2, ArrowRight, Loader2, Save } from 'lucide-react';
import { api } from '../services/api';
import { AIStudyPlan } from '../types';
import { useAuth } from '../context/AuthContext';

interface StudyPlannerViewProps {
  onNavigateToTimetable: () => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({ onNavigateToTimetable }) => {
  const { showToast } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Web Technologies & Cloud Systems',
    'Database Management Systems',
    'Computer Networks'
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [upcomingExams, setUpcomingExams] = useState('6th Semester Exams in 10 days');
  const [dailyHours, setDailyHours] = useState(4.5);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [priority, setPriority] = useState('Exam Prep Focus');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIStudyPlan | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const availableSubjectsList = [
    'Web Technologies & Cloud Systems',
    'Database Management Systems',
    'Computer Networks',
    'Design & Analysis of Algorithms',
    'Artificial Intelligence & Machine Learning',
    'Operating Systems',
    'Discrete Mathematics'
  ];

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim() && !selectedSubjects.includes(newSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleGeneratePlan = async () => {
    if (selectedSubjects.length === 0) {
      showToast('Please select at least one subject', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.generateStudyPlan({
        subjects: selectedSubjects,
        upcomingExams,
        dailyHours,
        difficulty,
        priority
      });
      setPlan(res.plan);
      showToast('AI Study Plan generated successfully with Gemini!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToTimetable = async () => {
    if (!plan || !plan.dailySchedule) return;
    setSavingSchedule(true);
    try {
      // Map daily schedule into timetable entries
      const timetableSessions = plan.dailySchedule.map((item, index) => {
        const [start, end] = item.time.split('-').map(t => t.trim());
        const colorPalette = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
        return {
          title: item.activity,
          subject: item.subject,
          dayOfWeek: ((index % 5) + 1), // Mon through Fri
          startTime: start || '09:00',
          endTime: end || '10:30',
          color: colorPalette[index % colorPalette.length],
          room: 'Study Space'
        };
      });

      await api.importTimetableSchedule(timetableSessions);
      showToast('Study schedule successfully imported to your Smart Timetable!', 'success');
      onNavigateToTimetable();
    } catch (err: any) {
      showToast(err.message || 'Failed to save timetable', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash Powered</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              AI Intelligent Study Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Personalized schedules mathematically weighted by exam deadlines, course credits, and Pomodoro rest intervals.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two Column Configuration Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Settings Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Target Parameters
          </h2>

          {/* Subjects selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Enrolled Subjects ({selectedSubjects.length})
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableSubjectsList.map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                        : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{subj}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Custom subject input */}
            <form onSubmit={handleAddCustomSubject} className="mt-2 flex gap-1.5">
              <input
                type="text"
                placeholder="+ Add custom subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Add
              </button>
            </form>
          </div>

          {/* Upcoming exams */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upcoming Exams / Project Milestones
            </label>
            <input
              type="text"
              value={upcomingExams}
              onChange={(e) => setUpcomingExams(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Daily available hours slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Daily Study Target</label>
              <span className="text-xs font-mono font-bold text-indigo-600 tabular-nums">{dailyHours} hrs/day</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 hr</span>
              <span>5 hrs</span>
              <span>10 hrs</span>
            </div>
          </div>

          {/* Difficulty & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced (Gate/Honors)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Strategy</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Exam Prep Focus">Exam Prep Focus</option>
                <option value="Balanced Mastery">Balanced Mastery</option>
                <option value="Active Recall Deep">Active Recall</option>
                <option value="Lab & Coding">Lab &amp; Coding</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 space-y-5">
          {plan ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-300">
              
              {/* Plan Header & Save CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Generated Academic Timetable &amp; Strategy
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target weekly focus: <strong className="font-mono text-slate-800">{plan.weeklyHours} hours</strong>
                  </p>
                </div>

                <button
                  onClick={handleSaveToTimetable}
                  disabled={savingSchedule}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSchedule ? 'Saving...' : 'Sync to Smart Timetable'}</span>
                </button>
              </div>

              {/* Summary & Priority analysis */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                <p className="font-semibold text-indigo-900">{plan.summary}</p>
                <p className="text-indigo-700 leading-relaxed">{plan.priorityAnalysis}</p>
              </div>

              {/* Daily Schedule Blocks */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Optimal Daily Routine
                </h4>
                <div className="space-y-2">
                  {plan.dailySchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-indigo-600 shrink-0 w-28">
                          {item.time}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.activity}</p>
                          <span className="text-[11px] text-slate-500">{item.subject}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.focus === 'High' ? 'bg-rose-100 text-rose-700' :
                        item.focus === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.focus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision tips & Break Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                  <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Revision Suggestions</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                    {plan.revisionTips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                  <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Break &amp; Recovery Strategy</span>
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {plan.breakSchedule}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Study Plan Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Select your enrolled subjects, set your daily study bandwidth, and click <strong>"Generate Plan"</strong> to get a scientifically structured timetable from Gemini.
              </p>
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Generate First Plan
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
