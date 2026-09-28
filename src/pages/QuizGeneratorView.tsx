import React, { useState, useEffect } from 'react';
import { Award, Sparkles, Clock, CheckCircle2, XCircle, Trophy, RotateCcw, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { QuizQuestion, QuizAttempt } from '../types';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../utils/audio';

export const QuizGeneratorView: React.FC = () => {
  const { showToast, setCoins, user } = useAuth();
  
  // Setup form states
  const [subject, setSubject] = useState('Database Management Systems');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [customContext, setCustomContext] = useState('');
  const [loading, setLoading] = useState(false);

  // Active quiz states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<QuizAttempt[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.getQuizzes();
      setLeaderboard(res.leaderboard || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Timer loop while taking quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !quizCompleted) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, quizCompleted]);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.generateQuiz({
        subject,
        difficulty,
        numQuestions,
        notesContent: customContext
      });

      if (res.quiz && res.quiz.questions && res.quiz.questions.length > 0) {
        setQuizQuestions(res.quiz.questions);
        setCurrentIdx(0);
        setUserAnswers({});
        setQuizCompleted(false);
        setTimeSpent(0);
        setTimerActive(true);
        showToast('Academic Quiz generated! Timer started.', 'success');
      } else {
        throw new Error('No questions returned');
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (quizCompleted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizQuestions) return;
    setTimerActive(false);

    // Calculate score
    let score = 0;
    quizQuestions.forEach(q => {
      if (userAnswers[q.id] === q.answerIndex) {
        score += 1;
      }
    });

    setQuizCompleted(true);
    soundFX.playComplete();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      const res = await api.submitQuiz({
        subject,
        difficulty,
        score,
        totalQuestions: quizQuestions.length,
        timeSpentSeconds: timeSpent
      });

      if (user) {
        setCoins(user.coins + (res.coinsEarned || 20));
      }
      showToast(`Quiz completed! Score: ${score}/${quizQuestions.length}. Earned ${res.coinsEarned || 20} Coins!`, 'success');
      fetchLeaderboard();
    } catch (e) {
      showToast('Error saving quiz attempt', 'error');
    }
  };

  const handleRetake = () => {
    setQuizQuestions(null);
    setUserAnswers({});
    setQuizCompleted(false);
    setTimeSpent(0);
  };

  const scoreCount = quizQuestions
    ? quizQuestions.filter(q => userAnswers[q.id] === q.answerIndex).length
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>AI Quiz Generator &amp; Leaderboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Test your subject comprehension with Gemini-generated adaptive questions, instant scoring, and peer rankings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quiz Generator Setup OR Active Question Interface */}
        <div className="lg:col-span-2 space-y-6">
          {!quizQuestions ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Configure Practice Assessment
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Database Management Systems">Database Management Systems (DBMS)</option>
                    <option value="Web Technologies & Cloud Systems">Web Technologies &amp; Cloud Systems</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Design & Analysis of Algorithms">Algorithms (DAA)</option>
                    <option value="Artificial Intelligence & Machine Learning">AI &amp; Machine Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Beginner">Beginner (Foundations)</option>
                    <option value="Intermediate">Intermediate (Core Engineering)</option>
                    <option value="Advanced">Advanced (GATE / Lab Exam Style)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Questions</label>
                <div className="flex gap-3">
                  {[3, 5, 8, 10].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNumQuestions(count)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        numQuestions === count
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional: Focus Context / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste specific topic excerpt (e.g. Normalization BCNF rules, or OSI Data Link layer protocols) to focus questions on that area"
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini is generating quiz questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate &amp; Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          ) : !quizCompleted ? (
            /* Active Taking Quiz UI */
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    Question {currentIdx + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {subject} · {difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{timeSpent}s</span>
                </div>
              </div>

              {/* Current Question */}
              {(() => {
                const q = quizQuestions[currentIdx];
                const selectedOpt = userAnswers[q.id];

                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {currentIdx + 1}. {q.question}
                    </h3>

                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full p-3.5 text-left text-xs sm:text-sm rounded-xl border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold ring-1 ring-indigo-300'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt}</span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                >
                  Previous
                </button>

                {currentIdx < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                  >
                    Finish &amp; Submit Quiz
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Results & Review Mode */
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Score header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white text-center space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
                  Assessment Completed
                </span>
                <div className="text-4xl font-extrabold font-mono">
                  {scoreCount} / {quizQuestions.length}
                </div>
                <p className="text-xs text-indigo-200">
                  Score: <strong className="text-white">{Math.round((scoreCount / quizQuestions.length) * 100)}%</strong> · Time: {timeSpent} seconds
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Another Quiz</span>
                  </button>
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Answer Review
                </h4>
                {quizQuestions.map((q, qIdx) => {
                  const userAns = userAnswers[q.id];
                  const isCorrect = userAns === q.answerIndex;

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-start gap-2 justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {qIdx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1 text-xs font-semibold shrink-0">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1 text-xs font-semibold shrink-0">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 space-y-1">
                        <p><strong>Your answer:</strong> {userAns !== undefined ? q.options[userAns] : 'Not answered'}</p>
                        <p className="text-emerald-700 font-semibold">
                          <strong>Correct answer:</strong> {q.options[q.answerIndex]}
                        </p>
                        <p className="text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Right Column: Global Peer Leaderboard */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Campus Quiz Leaderboard</span>
            </h3>

            <div className="space-y-2.5">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-800' :
                      idx === 2 ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{item.userName}</p>
                      <span className="text-[10px] text-slate-400 truncate">{item.subject}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-900">{item.score}/{item.totalQuestions}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{item.timeSpentSeconds}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
