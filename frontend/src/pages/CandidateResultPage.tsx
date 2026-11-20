import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import {
  CheckCircle2,
  Clock,
  Building,
  Briefcase,
  AlertCircle,
  FileCheck2,
  Info,
  LogOut,
  HelpCircle,
  UserCheck,
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
      setLoading(true);
      try {
        const candidateId = currentUser?.candidateId || 'INZ-CAND-2026-00001';
        const res = await api.getCandidateResult(candidateId);
        if (res.success && res.result) {
          setResult(res.result);
        }
      } catch (err) {
        console.error('Failed to load candidate submission summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [currentUser, resultData]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Retrieving Assessment Submission Confirmation...</p>
      </div>
    );
  }

  // Attempt count calculations
  const totalQuestions = result?.totalQuestions || 45;
  const attemptedCount =
    result?.totalAttempted !== undefined
      ? result.totalAttempted
      : result?.totalQuestionsAttempted !== undefined
      ? result.totalQuestionsAttempted
      : 45;

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

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
              Online Assessment Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Assessment Submitted Successfully
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              INZOVATE TECHNOLOGIES PRIVATE LIMITED • CIN: U62011TZ2025PTC036329
            </p>
          </div>
        </div>

        {/* Candidate & Attempt Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Attempt Highlight Widget */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center justify-center sm:justify-start">
                <FileCheck2 className="w-4 h-4 mr-1.5 text-blue-600" />
                Assessment Submission Metric
              </span>
              <p className="text-sm font-semibold text-slate-700">Questions Attempted</p>
              <p className="text-xs text-slate-500">All responses have been securely synced and recorded on the server.</p>
            </div>
            <div className="text-right sm:text-right">
              <div className="inline-flex items-baseline space-x-1 px-4 py-2 rounded-xl bg-white border border-blue-200 shadow-sm">
                <span className="text-3xl font-black text-blue-700">{attemptedCount}</span>
                <span className="text-base font-semibold text-slate-400">/ {totalQuestions}</span>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Recorded Successfully</p>
            </div>
          </div>

          {/* Candidate Dossier Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Candidate Name</span>
              <p className="text-sm font-bold text-slate-800">
                {result?.candidateName || currentUser?.fullName || 'Registered Candidate'}
              </p>
              <p className="text-xs font-mono text-slate-500">
                Candidate ID: {result?.candidateDisplayId || currentUser?.candidateId || 'INZ-CAND-2026-XXXXX'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Applied Role</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                {result?.jobRoleTitle || (currentUser as any)?.domain || 'Software Development Engineer'}
              </p>
              <p className="text-xs text-slate-500">Campus Fresher Recruitment 2026</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Institution / College</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Building className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {result?.collegeName || (currentUser as any)?.collegeName || currentUser?.collegeId || 'Registered Engineering College'}
              </p>
              <p className="text-xs text-slate-500">Official Drive Participant</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Submission Time</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500 font-mono">Session ID: {result?.sessionId || 'SESSION-SYNCED'}</p>
            </div>
          </div>

          {/* Privacy & Evaluation Policy Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-left">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-950">Recruitment Evaluation & Score Disclosure Policy:</p>
              <p>
                In accordance with Inzovate Technologies Recruitment Guidelines, detailed performance scores, technical
                marks, and answer keys are confidential and accessible strictly to the Recruiting Committee &
                Administrative Panel.
              </p>
              <p>
                Our HR team will review your submission, proctoring telemetry, and academic profile. Shortlisted
                candidates for subsequent technical interviews will be notified via email / phone.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Thank you for appearing for the Inzovate Assessment.</p>
            <div className="flex items-center space-x-3">
              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
                >
                  Return to Dashboard
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Securely</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
