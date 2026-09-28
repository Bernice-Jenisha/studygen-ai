import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { api } from '../services/api';
import { Assignment } from '../types';
import { useAuth } from '../context/AuthContext';

export const AssignmentTrackerView: React.FC = () => {
  const { showToast } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsg, setEditingAsg] = useState<Assignment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Web Technologies & Systems');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'submitted' | 'graded'>('pending');
  const [marks, setMarks] = useState('Pending');
  const [notes, setNotes] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await api.getAssignments();
      setAssignments(res.assignments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenAdd = () => {
    setEditingAsg(null);
    setTitle('');
    setSubject('Web Technologies & Systems');
    setDeadline(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16));
    setPriority('high');
    setStatus('pending');
    setMarks('Pending');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAsg(asg);
    setTitle(asg.title);
    setSubject(asg.subject);
    setDeadline(new Date(asg.deadline).toISOString().slice(0, 16));
    setPriority(asg.priority);
    setStatus(asg.status);
    setMarks(asg.marks || 'Pending');
    setNotes(asg.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsg) {
        const res = await api.updateAssignment(editingAsg.id, {
          title,
          subject,
          deadline,
          priority,
          status,
          marks,
          notes
        });
        setAssignments(assignments.map(a => a.id === editingAsg.id ? res.assignment : a));
        showToast('Assignment updated', 'success');
      } else {
        const res = await api.createAssignment({
          title,
          subject,
          deadline,
          priority,
          marks,
          notes
        });
        setAssignments([res.assignment, ...assignments]);
        showToast('New assignment tracked', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving assignment', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      setAssignments(assignments.filter(a => a.id !== id));
      showToast('Assignment deleted', 'info');
    } catch (e) {
      showToast('Failed to delete assignment', 'error');
    }
  };

  const handleStatusChange = async (asg: Assignment, newStatus: any) => {
    try {
      const res = await api.updateAssignment(asg.id, { status: newStatus });
      setAssignments(assignments.map(a => a.id === asg.id ? res.assignment : a));
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>Assignment &amp; Lab Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track term assignments, deadlines, evaluation marks, and automatic overdue notifications.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Track Assignment</span>
        </button>
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((asg) => {
          const isLate = new Date(asg.deadline) < new Date() && asg.status !== 'submitted' && asg.status !== 'graded';
          const deadlineFormatted = new Date(asg.deadline).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={asg.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                isLate ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/80 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    asg.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                    asg.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {asg.priority} priority
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(asg)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(asg.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Subject */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {asg.title}
                </h3>
                <p className="text-xs font-medium text-indigo-600 mb-3">
                  {asg.subject}
                </p>

                {asg.notes && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    {asg.notes}
                  </p>
                )}

                {/* Overdue alert banner if late */}
                {isLate && (
                  <div className="mb-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Past deadline — submit immediately</span>
                  </div>
                )}
              </div>

              {/* Bottom footer: Deadline, Marks, and Status select */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{deadlineFormatted}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-700">
                    Marks: {asg.marks || 'Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                  <select
                    value={asg.status}
                    onChange={(e) => handleStatusChange(asg, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none capitalize ${
                      asg.status === 'submitted' || asg.status === 'graded'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : asg.status === 'in_progress'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingAsg ? 'Edit Assignment' : 'Track New Assignment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Socket Programming Chat Server"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marks / Score</label>
                  <input
                    type="text"
                    placeholder="e.g. 94/100 or Pending"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Notes</label>
                <textarea
                  rows={2}
                  placeholder="Submission instructions, portal links, or professor guidelines"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
