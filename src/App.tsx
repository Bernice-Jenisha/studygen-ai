import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './pages/DashboardView';
import { StudyPlannerView } from './pages/StudyPlannerView';
import { TimetableView } from './pages/TimetableView';
import { TaskManagerView } from './pages/TaskManagerView';
import { AssignmentTrackerView } from './pages/AssignmentTrackerView';
import { PomodoroTimerView } from './pages/PomodoroTimerView';
import { NotesAssistantView } from './pages/NotesAssistantView';
import { QuizGeneratorView } from './pages/QuizGeneratorView';
import { GoalTrackerView } from './pages/GoalTrackerView';
import { HabitTrackerView } from './pages/HabitTrackerView';
import { ProductivityCoachView } from './pages/ProductivityCoachView';
import { MarketplaceView } from './pages/MarketplaceView';
import { ChatAssistantView } from './pages/ChatAssistantView';
import { DeveloperHubView } from './pages/DeveloperHubView';
import { AdminPanelView } from './pages/AdminPanelView';
import { AuthModal } from './pages/AuthModal';
import { MessageSquare, Sparkles, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, toast } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'planner' && <StudyPlannerView onNavigateToTimetable={() => setActiveTab('timetable')} />}
          {activeTab === 'timetable' && <TimetableView />}
          {activeTab === 'tasks' && <TaskManagerView />}
          {activeTab === 'assignments' && <AssignmentTrackerView />}
          {activeTab === 'pomodoro' && <PomodoroTimerView />}
          {activeTab === 'notes' && <NotesAssistantView />}
          {activeTab === 'quiz' && <QuizGeneratorView />}
          {activeTab === 'coach' && <ProductivityCoachView />}
          {activeTab === 'goals' && <GoalTrackerView />}
          {activeTab === 'habits' && <HabitTrackerView />}
          {activeTab === 'marketplace' && <MarketplaceView />}
          {activeTab === 'chat' && <ChatAssistantView />}
          {(activeTab === 'developer-hub' || activeTab === 'webtech-lab') && <DeveloperHubView />}
          {activeTab === 'admin' && <AdminPanelView />}
        </main>
      </div>

      {/* Floating AI Assistant Action Button (Quick open Chat) */}
      {activeTab !== 'chat' && (
        <button
          onClick={() => setActiveTab('chat')}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
          title="Open AI Study Tutor Chat"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline text-xs font-bold pr-1">Ask AI Tutor</span>
        </button>
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-900 border-rose-800 text-white'
              : toast.type === 'info'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-indigo-950 border-indigo-800 text-white'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
