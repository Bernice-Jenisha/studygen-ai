import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, SkipForward, Flame, Coins, CheckCircle, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { PomodoroSession } from '../types';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audio';

export const PomodoroTimerView: React.FC = () => {
  const { showToast, setCoins, user } = useAuth();
  
  // Timer modes
  const MODES = [
    { name: '25/5 Classic', workMinutes: 25, breakMinutes: 5, coins: 15 },
    { name: '50/10 Extended', workMinutes: 50, breakMinutes: 10, coins: 35 },
    { name: '90/20 Ultradian', workMinutes: 90, breakMinutes: 20, coins: 60 },
  ];

  const [selectedModeIndex, setSelectedModeIndex] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MODES[0].workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState('Web Technologies & Systems');
  
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const activeMode = MODES[selectedModeIndex];
  const totalDuration = (isBreak ? activeMode.breakMinutes : activeMode.workMinutes) * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.getPomodoroStats();
      setHistory(res.sessions || []);
      setTotalMinutes(res.totalMinutes || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Interval timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isBreak, selectedModeIndex]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    soundFX.playComplete();

    if (!isBreak) {
      // Completed work session
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
      try {
        const res = await api.logPomodoroSession({
          mode: activeMode.name,
          durationMinutes: activeMode.workMinutes,
          subject
        });
        if (user) {
          setCoins(user.coins + activeMode.coins);
        }
        showToast(`Focus block finished! +${activeMode.coins} coins earned. Enjoy a well-deserved break!`, 'success');
        fetchStats();
      } catch (e) {
        showToast('Session finished!', 'success');
      }
      setIsBreak(true);
      setTimeLeft(activeMode.breakMinutes * 60);
    } else {
      // Completed break
      showToast('Break finished! Ready for another deep focus block?', 'info');
      setIsBreak(false);
      setTimeLeft(activeMode.workMinutes * 60);
    }
  };

  const handleTogglePlay = () => {
    if (!isRunning) {
      soundFX.playStart();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft((isBreak ? activeMode.breakMinutes : activeMode.workMinutes) * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(activeMode.breakMinutes * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(activeMode.workMinutes * 60);
    }
  };

  const handleChangeMode = (index: number) => {
    setSelectedModeIndex(index);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(MODES[index].workMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Timer className="w-6 h-6 text-indigo-600" />
            <span>Pomodoro Focus Timer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Scientific interval study technique. Earn 15 to 60 Productivity Coins per session completed!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Subject:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none"
          >
            <option value="Web Technologies & Systems">Web Technologies &amp; Systems</option>
            <option value="Database Management Systems">Database Management (DBMS)</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Design & Analysis of Algorithms">Algorithms (DAA)</option>
            <option value="AI / ML Practice">AI / ML Practice</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Timer Display */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center space-y-6">
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {MODES.map((mode, idx) => (
              <button
                key={mode.name}
                onClick={() => handleChangeMode(idx)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedModeIndex === idx
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>

          {/* Status Label */}
          <div className="text-center">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              isBreak ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {isBreak ? '☕ Rest & Rejuvenate' : '🎯 Deep Study Focus'}
            </span>
            <p className="text-xs text-slate-400 mt-2">
              Working on: <strong className="text-slate-700">{subject}</strong>
            </p>
          </div>

          {/* SVG Circular Progress Timer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100"
                strokeWidth="5"
                fill="none"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-300 ${isBreak ? 'stroke-emerald-500' : 'stroke-indigo-600'}`}
                strokeWidth="5.5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {formattedTime}
              </span>
              <span className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                +{activeMode.coins} Coins on completion
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md flex items-center gap-2 transition-all transform active:scale-95 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>{timeLeft === totalDuration ? 'Start Focus' : 'Resume'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="p-3 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Skip to next phase"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Focus Stats & History Sidebar */}
        <div className="space-y-4">
          
          {/* Summary Box */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-xs">
            <span className="text-xs text-indigo-100 uppercase font-semibold">Total Pomodoro Time</span>
            <div className="text-3xl font-bold font-mono mt-1">
              {(totalMinutes / 60).toFixed(1)} <span className="text-sm font-sans font-normal text-indigo-200">hours</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-indigo-100 border-t border-indigo-400/30 pt-3">
              <span>{history.length} Sessions Logged</span>
              <span className="flex items-center gap-1 font-semibold text-amber-200">
                <Coins className="w-3.5 h-3.5 fill-current" />
                {history.reduce((acc, c) => acc + c.coinsEarned, 0)} Coins Won
              </span>
            </div>
          </div>

          {/* History list */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Recent Focus Sessions
            </h3>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {history.length > 0 ? (
                history.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 truncate">{item.subject}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.mode} · {item.durationMinutes} mins
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-600 flex items-center gap-0.5">
                      +{item.coinsEarned}🪙
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">No sessions yet</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
