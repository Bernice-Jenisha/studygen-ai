import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, TrendingUp, ShoppingBag, MessageSquare, RotateCcw, Award, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPanelView: React.FC = () => {
  const { showToast, user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [anRes, usRes, fbRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminUsers(),
        api.sendFeedback(5, '').catch(() => ({ feedback: [] })) // get feedback
      ]);
      setAnalytics(anRes);
      setUsersList(usRes.users || []);
      const fb = await fetch('/api/feedback').then(r => r.json()).catch(() => ({ feedback: [] }));
      setFeedbackList(fb.feedback || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await api.updateAdminUserRole(userId, nextRole);
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      showToast(`User role updated to ${nextRole}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Error updating role', 'error');
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database to initial sample records?')) {
      return;
    }
    try {
      await api.resetDatabase();
      showToast('Database reset to defaults successfully', 'success');
      fetchAdminData();
    } catch (e: any) {
      showToast('Error resetting database', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Faculty &amp; Administrator Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            System Administration &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor student adoption metrics, manage role permissions, view feedback, and manage system datasets.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          className="px-4 py-2 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Database</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Registered Scholars</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {analytics.totalUsers}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Focus Hours Logged</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {(analytics.totalPomodoroMinutes / 60).toFixed(1)} <span className="text-xs font-sans text-slate-500 font-normal">hrs</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Marketplace Invoices</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {analytics.totalOrders} <span className="text-xs font-sans text-slate-500 font-normal">({analytics.totalCoinsSpent}🪙)</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Avg Quiz Score</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {analytics.averageQuizScore}%
            </div>
          </div>
        </div>
      )}

      {/* Two Column Grid: User Accounts Table & Student Feedback Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Role Management */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Scholars &amp; Permissions</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Name / Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 font-mono">Coins</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-600">{u.coins}🪙</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Feedback Inbox */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>Student Feedback Inbox</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {feedbackList.length > 0 ? (
              feedbackList.map((fb) => (
                <div key={fb.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{fb.userName}</span>
                    <span className="text-amber-500 font-bold">{'★'.repeat(fb.rating)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{fb.message}"
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Received: {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No feedback records found</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
