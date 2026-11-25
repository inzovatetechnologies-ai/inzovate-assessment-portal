import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import {
  CheckCircle2,
  Clock,
  Building,
  Briefcase,
  FileCheck2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface CandidateResultPageProps {
  currentUser: User | null;
  resultData?: any;
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

export const CandidateResultPage: React.FC<CandidateResultPageProps> = ({
  currentUser,
  resultData,
  onNavigateHome,
  onLogout,
}) => {
  const [result, setResult] = useState<any>(resultData || null);
  const [loading, setLoading] = useState(!resultData);

  useEffect(() => {
    if (resultData) {
      setResult(resultData);
      setLoading(false);
      return;
    }

    async function loadResult() {
      const candidateId = currentUser?.candidateId || currentUser?.email;
      if (!candidateId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.getCandidateResult(candidateId);
        if (res.success && res.result) {
          setResult(res.result);
        }
      } catch (err) {
        console.error('Failed to load candidate submission confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [currentUser, resultData]);

  // Strict Instant Scroll-To-Top on Mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Confirming Assessment Submission...</p>
      </div>
    );
  }

  const candidateName =
    (result?.candidateName && result.candidateName !== 'Candidate' ? result.candidateName : null) ||
    currentUser?.fullName ||
    'Registered Candidate';
  const candidateId =
    result?.candidateDisplayId || result?.candidateId || currentUser?.candidateId || 'Verified Candidate';
  const jobRole =
    result?.jobRoleTitle || (currentUser as any)?.jobRoleTitle || (currentUser as any)?.domain || 'Applied Role';
  const domainName =
    result?.domainName || (currentUser as any)?.domainName || 'Assessment Domain';
  const collegeName =
    result?.collegeName || (currentUser as any)?.collegeName || currentUser?.collegeId || 'Campus Drive Institution';
  const submittedAt = result?.completedAt ? new Date(result.completedAt) : new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Top Completion Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A1128] via-[#101F42] to-[#0A1128] text-white p-8 text-center space-y-4">
          <div className="flex justify-center mb-1">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-blue-400/30 shadow-lg flex items-center justify-center">
              <img src="/inzovate-logo.png" alt="Inzovate Technologies" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
              Online Assessment Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Thank You! Your Exam Is Finished
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              INZOVATE TECHNOLOGIES PRIVATE LIMITED • CIN: U62011TZ2025PTC036329
            </p>
          </div>
        </div>

        {/* Professional Submission Confirmation */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="inline-flex items-center justify-center sm:justify-start space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider shadow-sm w-fit mx-auto sm:mx-0">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Status: Submitted &amp; Recorded</span>
              </span>
              <span className="inline-flex items-center justify-center space-x-1 text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Response Integrity Verified</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Your assessment has been successfully completed and submitted.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your responses have been securely saved for evaluation by our recruitment team. Official evaluation
              outcomes and next-round interview schedules will be communicated directly by{' '}
              <strong>Inzovate Technologies HR</strong> or your campus placement office.
            </p>
          </div>

          {/* Candidate Identification Summary (No Marks / No Scores) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Candidate Name</span>
              <p className="text-sm font-bold text-slate-800">{candidateName}</p>
              <p className="text-xs font-mono text-slate-500">Candidate ID: {candidateId}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Applied Role &amp; Domain</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
                <span>{jobRole}</span>
              </p>
              <p className="text-xs text-sky-600 font-semibold">{domainName}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Institution / College</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Building className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
                <span>{collegeName}</span>
              </p>
              <p className="text-xs text-slate-500">Official Drive Participant</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Submission Time</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
                <span>
                  {submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {submittedAt.toLocaleDateString()}
                </span>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Ref: {result?.sessionId || 'SESSION-SUBMITTED'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
              >
                Return to Home
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out Securely</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
