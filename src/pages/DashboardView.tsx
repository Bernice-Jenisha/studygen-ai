import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Coins,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Play,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Task, Assignment, PomodoroSession } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pomodoro, setPomodoro] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, asgRes, pomoRes] = await Promise.all([
          api.getTasks(),
          api.getAssignments(),
          api.getPomodoroStats()
        ]);
        setTasks(taskRes.tasks || []);
        setAssignments(asgRes.assignments || []);
        setPomodoro(pomoRes.sessions || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalFocusMinutes = pomodoro.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const pendingAssignments = assignments.filter(a => a.status !== 'submitted' && a.status !== 'graded');
  const productivityScore = Math.min(98, Math.max(65, Math.round((completedTasksCount * 12) + (user?.streak || 1) * 3 + 40)));

  // Daily hours mockup data (Mon - Sun)
  const dailyStudyData = [
    { day: 'Mon', hours: 4.2 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 5.0 },
    { day: 'Thu', hours: 2.8 },
    { day: 'Fri', hours: 4.5 },
    { day: 'Sat', hours: 6.0 },
    { day: 'Sun', hours: 3.2 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Academic Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Scholar'}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            You're currently on a <strong className="text-white font-mono">{user?.streak || 7}-day</strong> study streak. Keep up the momentum to unlock semester honors and earn marketplace rewards!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('pomodoro')}
            className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Pomodoro</span>
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="px-4 py-2.5 bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl border border-indigo-400/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Plan</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Today's Focus Hours */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Today's Focus</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalFocusHours} <span className="text-xs font-sans text-slate-500 font-normal">hrs</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +18% vs yesterday
          </div>
        </div>

        {/* Weekly Study */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Weekly Total</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            29.2 <span className="text-xs font-sans text-slate-500 font-normal">hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Goal: 30 hrs (97%)
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Assignments</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {pendingAssignments.length}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            1 due in 48 hours
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {completedTasksCount} <span className="text-xs font-sans text-slate-500 font-normal">/ {tasks.length}</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            +{completedTasksCount * 10} coins earned
          </div>
        </div>

        {/* Productivity Score */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Productivity</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {productivityScore}%
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            Top 5% Cohort
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Streak</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {user?.streak || 7} <span className="text-xs font-sans text-slate-500 font-normal">days</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-500" /> {user?.coins || 450} coins
          </div>
        </div>

      </div>

      {/* Charts & Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Study Hours SVG Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Study Hours (Weekly Analytics)</h3>
              <p className="text-xs text-slate-500">Tracked via Pomodoro and Timetable logged blocks</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Target: 4.5h / day
            </span>
          </div>

          <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {dailyStudyData.map((item, idx) => {
              const heightPercent = Math.min(100, Math.round((item.hours / 6.5) * 100));
              const isToday = item.day === 'Mon'; // example marker
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.hours}h
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg relative overflow-hidden flex items-end" style={{ height: '100%' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-purple-500'
                          : 'bg-indigo-400 hover:bg-indigo-500'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3">
            <span>Minimum: 2.8 hrs (Thu)</span>
            <span>Peak Focus: 6.0 hrs (Sat)</span>
          </div>
        </div>

        {/* Subject Focus Breakdown (Donut Distribution) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Subject Time Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Focus allocation across enrolled subjects</p>

            {/* Visual SVG Donut Chart */}
            <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 1: Web Technologies (35%) */}
                <path
                  className="text-indigo-600"
                  strokeDasharray="35, 100"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 2: DBMS (28%) */}
                <path
                  className="text-purple-500"
                  strokeDasharray="28, 100"
                  strokeDashoffset="-35"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 3: Networks (22%) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray="22, 100"
                  strokeDashoffset="-63"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 4: DAA/Algorithms (15%) */}
                <path
                  className="text-amber-500"
                  strokeDasharray="15, 100"
                  strokeDashoffset="-85"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono text-slate-900">4 Subjects</span>
                <span className="text-[10px] text-slate-400">Total 29.2h</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-1.5 text-xs text-slate-600 mt-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Web Technologies</span>
                <span className="font-mono tabular-nums font-semibold">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> DBMS</span>
                <span className="font-mono tabular-nums font-semibold">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Computer Networks</span>
                <span className="font-mono tabular-nums font-semibold">22%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Design of Algorithms</span>
                <span className="font-mono tabular-nums font-semibold">15%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Grid: Upcoming Deadlines & Priority Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Urgent Assignments Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Urgent Assignments &amp; Labs</h3>
              <p className="text-xs text-slate-500">Track deadlines, submission status, and lab reports</p>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {assignments.slice(0, 3).map((asg) => {
              const isLate = new Date(asg.deadline) < new Date() && asg.status !== 'submitted' && asg.status !== 'graded';
              return (
                <div
                  key={asg.id}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                    isLate
                      ? 'border-rose-200 bg-rose-50/50'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-800 truncate">{asg.title}</span>
                      {isLate && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded uppercase">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{asg.subject}</span>
                      <span>·</span>
                      <span className="font-mono">{new Date(asg.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${
                    asg.status === 'submitted' ? 'bg-emerald-50 text-emerald-700' :
                    asg.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {asg.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Today Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Priority Tasks</h3>
              <p className="text-xs text-slate-500">Live task checklist with coin rewards</p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Task Manager <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <div className="truncate">
                    <p className={`text-xs font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Due: {task.dueDate} · {task.label}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                  task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
