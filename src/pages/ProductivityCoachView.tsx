import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Loader2, Quote } from 'lucide-react';
import { api } from '../services/api';
import { AICoachFeedback } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProductivityCoachView: React.FC = () => {
  const { showToast, user } = useAuth();
  const [coachData, setCoachData] = useState<AICoachFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCoachAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.getAICoachAnalysis();
      setCoachData(res.coach);
    } catch (e: any) {
      showToast(e.message || 'Error generating coach advice', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Deep Behavioral Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            <span>AI Academic Productivity Coach</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gemini analyzes your real study logs, completed tasks, missed deadlines, and Pomodoro patterns to deliver tailored advice.
          </p>
        </div>

        <button
          onClick={fetchCoachAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Re-Analyze Performance</span>
        </button>
      </div>

      {coachData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Score & Headline Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                Performance Evaluation for {user?.name || 'Student'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">
                Productivity Health: <span className="text-emerald-400 font-mono">{coachData.overallScore}%</span>
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Your discipline trajectory is currently strong. By addressing upcoming project deadlines and evening focus dips, your retention will increase by up to 25%.
              </p>
            </div>

            {/* Motivational Quote */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-xl max-w-sm flex items-start gap-3">
              <Quote className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
              <p className="text-xs italic text-indigo-100 leading-relaxed">
                "{coachData.motivationalQuote}"
              </p>
            </div>
          </div>

          {/* Strengths & Bottlenecks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Strengths */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Demonstrated Academic Strengths</span>
              </h3>
              <div className="space-y-2">
                {coachData.strengths.map((str, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-medium">{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottlenecks */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Identified Bottlenecks &amp; Vulnerabilities</span>
              </h3>
              <div className="space-y-2">
                {coachData.bottlenecks.map((bot, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-950 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-medium">{bot}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Personalized Action Plan for This Week
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coachData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                        Action #{idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                        rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">
                      {rec.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rec.action}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                    <span>Target: Next 48 Hours</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
