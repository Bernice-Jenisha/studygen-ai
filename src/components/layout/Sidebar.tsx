import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  FileSpreadsheet,
  Timer,
  BookOpen,
  Award,
  Target,
  Flame,
  BrainCircuit,
  ShoppingBag,
  MessageSquare,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();

  const navSections: NavSection[] = [
    {
      heading: 'Productivity & Planning',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'planner', label: 'AI Study Planner', icon: CalendarCheck },
        { id: 'timetable', label: 'Smart Timetable', icon: CalendarDays },
        { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
        { id: 'assignments', label: 'Assignments', icon: FileSpreadsheet },
        { id: 'pomodoro', label: 'Focus Timer', icon: Timer },
      ],
    },
    {
      heading: 'AI Intelligence',
      items: [
        { id: 'notes', label: 'Notes & Flashcards', icon: BookOpen },
        { id: 'quiz', label: 'AI Quiz Generator', icon: Award },
        { id: 'coach', label: 'Productivity Coach', icon: BrainCircuit },
        { id: 'chat', label: 'AI Tutor Chat', icon: MessageSquare },
      ],
    },
    {
      heading: 'Discipline & Store',
      items: [
        { id: 'goals', label: 'Goal Tracker', icon: Target },
        { id: 'habits', label: 'Habit Heatmap', icon: Flame },
        { id: 'marketplace', label: 'Study Marketplace', icon: ShoppingBag },
      ],
    },
    {
      heading: 'Architecture & Dev',
      items: [
        { id: 'developer-hub', label: 'Developer Hub', icon: Terminal, badge: 'API & Sandbox' },
        ...(user?.role === 'admin'
          ? [{ id: 'admin', label: 'Admin Console', icon: ShieldAlert, badge: 'Admin' }]
          : []),
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {section.heading}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
