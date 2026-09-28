import React from 'react';
import { Sparkles, Coins, Flame, UserCheck, LogOut, ShieldCheck, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { user, logout, switchDemoRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text wordmark Brand Zone */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              StudyGen AI
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors hover:text-slate-900 ${currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('planner')}
            className={`transition-colors hover:text-slate-900 ${currentTab === 'planner' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            AI Planner
          </button>
          <button
            onClick={() => onSelectTab('pomodoro')}
            className={`transition-colors hover:text-slate-900 ${currentTab === 'pomodoro' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Focus Timer
          </button>
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`transition-colors hover:text-slate-900 ${currentTab === 'marketplace' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => onSelectTab('developer-hub')}
            className={`flex items-center gap-1.5 transition-colors hover:text-indigo-600 ${currentTab === 'developer-hub' ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}
          >
            <Terminal className="w-4 h-4 text-purple-600" />
            <span>Developer Hub</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions & profile status */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Coins & Streak indicator */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Coins className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">{user.coins}</span>
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">{user.streak}d</span>
                </span>
              </div>

              {/* Demo quick role switch */}
              <button
                onClick={() => switchDemoRole(user.role === 'admin' ? 'student' : 'admin')}
                title={`Switch demo role (Currently: ${user.role})`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                {user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> : <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
                <span className="capitalize">{user.role}</span>
              </button>

              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
