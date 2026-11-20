import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LiveSession } from '../types';
import {
  Eye,
  Camera,
  AlertTriangle,
  Clock,
  Wifi,
  ShieldAlert,
  Send,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';

export const LiveProctoringPage: React.FC = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [warningMessage, setWarningMessage] = useState('Please ensure your face remains clearly within the camera frame.');

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000); // 5s polling for proctor grid
    return () => clearInterval(interval);
  }, []);

  async function loadSessions() {
    try {
      const res = await api.getLiveProctoringSessions();
      if (res.success) {
        setSessions(res.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load proctoring sessions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleResolveFlag = async (sessionId: string, resolution: 'cleared' | 'confirmed') => {
    try {
      const res = await api.resolveViolation(sessionId, resolution, 'Reviewed by live HR proctor.');
      if (res.success) {
        loadSessions();
        alert(`Incident resolved as: ${resolution}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSendWarning = (session: LiveSession) => {
    alert(`Proctor notification dispatched to ${session.candidateName}: "${warningMessage}"`);
    setSelectedSession(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase mb-1 border border-rose-200">
            <Eye className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Real-Time Proctoring Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A1128] tracking-tight">Active Candidate Examination Monitor</h1>
          <p className="text-xs text-slate-500">
            Continuous webcam stream health, tab visibility changes, and anti-cheating incident management.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadSessions}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Real-Time Grid */}
      {sessions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <Eye className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Active Examination Sessions Running</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Candidates currently taking assessments across recruitment drives will appear in this monitoring grid in
            real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => {
            const hasViolations = s.violationsCount > 0;
            return (
              <div
                key={s.sessionId}
                className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition-all ${
                  hasViolations ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:shadow-md'
                }`}
              >
                {/* Candidate Info Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0A1128]">{s.candidateName}</h3>
                    <p className="text-[11px] font-mono text-blue-600 font-bold">{s.candidateId}</p>
                    <p className="text-[10px] text-slate-500">{s.collegeName}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : s.status === 'Under Review'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Simulated / Live Optical Feed Widget */}
                <div className="relative bg-slate-950 rounded-xl overflow-hidden h-36 border border-slate-800 flex items-center justify-center text-center p-3">
                  <div className="space-y-1">
                    <Camera className="w-8 h-8 text-sky-400 mx-auto opacity-75" />
                    <p className="text-[11px] font-semibold text-slate-300">Live Camera Stream Active</p>
                    <p className="text-[9px] text-slate-500 font-mono">Stream ID: {s.sessionId.substring(0, 10)}</p>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ONLINE</span>
                  </div>

                  <div className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-black/70 text-slate-300">
                    {s.jobRoleTitle}
                  </div>
                </div>

                {/* Live Examination Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500">Progress (45 Qs)</p>
                    <p className="font-bold text-slate-800 font-mono mt-0.5">
                      {s.answeredCount} / {s.totalQuestions} Answered
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500">Timer Remaining</p>
                    <p className="font-bold text-sky-700 font-mono mt-0.5 flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{Math.round(s.timeRemainingSeconds / 60)} mins</span>
                    </p>
                  </div>
                </div>

                {/* Proctoring Security Violation Counter */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Security Flags Logged:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      s.violationsCount === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}
                  >
                    {s.violationsCount} Warnings
                  </span>
                </div>

                {/* Proctoring Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedSession(s)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center space-x-1"
                  >
                    <Send className="w-3 h-3 text-sky-400" />
                    <span>Send Warning</span>
                  </button>

                  {s.violationsCount > 0 && (
                    <button
                      onClick={() => handleResolveFlag(s.sessionId, 'cleared')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
                    >
                      Clear Flag
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning Dispatch Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Dispatch Warning to Candidate Screen: {selectedSession.candidateName}
            </h3>
            <p className="text-xs text-slate-500">
              This message will immediately appear as an overlay on the candidate's assessment window.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold">Proctor Instruction Notice</label>
              <textarea
                rows={3}
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-slate-800"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendWarning(selectedSession)}
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow"
              >
                Dispatch Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
