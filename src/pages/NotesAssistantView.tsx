import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Upload, FileText, CheckCircle2, ChevronDown, ChevronUp, Save, Trash2, Loader2, RotateCw } from 'lucide-react';
import { api } from '../services/api';
import { StudyNote } from '../types';
import { useAuth } from '../context/AuthContext';

export const NotesAssistantView: React.FC = () => {
  const { showToast } = useAuth();
  const [notesList, setNotesList] = useState<StudyNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  // Input states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Database Management Systems');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Active flashcard index
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<number, number>>({});

  const fetchNotes = async () => {
    try {
      const res = await api.getNotes();
      setNotesList(res.notes || []);
      if (res.notes && res.notes.length > 0 && !selectedNote) {
        setSelectedNote(res.notes[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      showToast(`Loaded file: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
    };
    reader.readAsText(file);
  };

  const handleSummarizeAndGenerate = async () => {
    if (!content.trim()) {
      showToast('Please paste or upload note content', 'error');
      return;
    }
    setLoading(true);
    try {
      const analysis = await api.summarizeNotes({
        title: title || 'Academic Study Notes',
        subject,
        content
      });

      // Save directly to notes database
      const saved = await api.createNote({
        title: title || `${subject} Notes Summary`,
        subject,
        originalContent: content,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        flashcards: analysis.flashcards,
        mcqs: analysis.mcqs
      });

      setNotesList([saved.note, ...notesList]);
      setSelectedNote(saved.note);
      setFlippedCards({});
      setSelectedMcqAnswers({});
      showToast('AI Summary, Flashcards, and MCQs generated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error summarizing notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deleteNote(id);
      const remaining = notesList.filter(n => n.id !== id);
      setNotesList(remaining);
      setSelectedNote(remaining[0] || null);
      showToast('Note removed from vault', 'info');
    } catch (e) {
      showToast('Failed to delete note', 'error');
    }
  };

  const toggleFlip = (idx: number) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash High-Yield Synthesizer</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              AI Notes Summarizer &amp; Flashcard Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Upload textbook chapters, paste lecture notes, and get instant summaries, key takeaways, revision flashcards, and exam MCQs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload & Input Form + Previous Saved Notes */}
        <div className="space-y-5">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Input Notes or Upload
            </h3>

            {/* Title & Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note Title</label>
              <input
                type="text"
                placeholder="e.g. DBMS Normalization 1NF to BCNF"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Database Management Systems">Database Management Systems (DBMS)</option>
                <option value="Web Technologies & Cloud Systems">Web Technologies &amp; Cloud Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Design & Analysis of Algorithms">Design of Algorithms</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            {/* File upload drop zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attach File (.txt, .md, .docx, .pdf text)
              </label>
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-indigo-600 bg-slate-50/50">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Click to upload lecture file</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Or Paste Lecture Content
              </label>
              <textarea
                rows={6}
                placeholder="Paste paragraph, chapter topics, or textbook definitions here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <button
              onClick={handleSummarizeAndGenerate}
              disabled={loading || !content.trim()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Flashcards &amp; MCQs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Summary &amp; Cards</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Vault Notes */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Saved Notes Vault ({notesList.length})
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {notesList.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setFlippedCards({});
                    setSelectedMcqAnswers({});
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedNote?.id === note.id
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-medium">{note.title}</p>
                    <span className="text-[10px] text-slate-400">{note.subject}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output Column: Summary, Keypoints, Flashcards, MCQs */}
        <div className="lg:col-span-2 space-y-6">
          {selectedNote ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
              
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedNote.subject}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {selectedNote.title}
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">
                  Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Executive Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Executive Summary
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 border border-slate-100 p-4 rounded-xl">
                  {selectedNote.summary}
                </p>
              </div>

              {/* Key Takeaways */}
              {selectedNote.keyPoints && selectedNote.keyPoints.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    High-Yield Exam Takeaways
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedNote.keyPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spaced Repetition Flashcards */}
              {selectedNote.flashcards && selectedNote.flashcards.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Spaced Repetition Flashcards ({selectedNote.flashcards.length})
                    </h3>
                    <span className="text-[11px] text-slate-400 italic">Click card to flip definition</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedNote.flashcards.map((card, idx) => {
                      const isFlipped = !!flippedCards[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleFlip(idx)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 min-h-[120px] flex flex-col justify-between ${
                            isFlipped
                              ? 'bg-indigo-900 border-indigo-800 text-white shadow-xs'
                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-2">
                              <span className={isFlipped ? 'text-indigo-300' : 'text-slate-400'}>
                                {isFlipped ? 'Answer Definition' : `Card #${idx + 1}`}
                              </span>
                              <RotateCw className={`w-3 h-3 ${isFlipped ? 'text-indigo-300' : 'text-slate-400'}`} />
                            </div>
                            <p className={`text-xs font-medium leading-relaxed ${isFlipped ? 'text-indigo-50' : 'text-slate-800'}`}>
                              {isFlipped ? card.answer : card.question}
                            </p>
                          </div>

                          <div className={`text-[10px] text-right mt-2 ${isFlipped ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            {isFlipped ? 'Click to see question' : 'Click to reveal'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MCQs Practice */}
              {selectedNote.mcqs && selectedNote.mcqs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Quick Practice MCQs
                  </h3>
                  <div className="space-y-4">
                    {selectedNote.mcqs.map((mcq, mIdx) => {
                      const selectedOpt = selectedMcqAnswers[mIdx];
                      return (
                        <div key={mIdx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">
                            {mIdx + 1}. {mcq.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mcq.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              const isCorrect = mcq.answerIndex === optIdx;
                              let btnClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

                              if (selectedOpt !== undefined) {
                                if (isCorrect) {
                                  btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                                } else if (isSelected) {
                                  btnClass = 'bg-rose-50 border-rose-300 text-rose-800';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => setSelectedMcqAnswers(prev => ({ ...prev, [mIdx]: optIdx }))}
                                  className={`p-2.5 text-xs text-left rounded-lg border transition-colors flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {selectedOpt !== undefined && isCorrect && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {selectedOpt !== undefined && (
                            <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs text-slate-600">
                              <strong className="text-slate-900">Explanation:</strong> {mcq.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-xs flex flex-col items-center justify-center">
              <BookOpen className="w-10 h-10 mb-2 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-800">No Note Selected</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Paste your notes on the left or select an existing note from the vault to inspect AI-generated flashcards and key takeaways.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
