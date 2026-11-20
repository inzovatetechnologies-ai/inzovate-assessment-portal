import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Candidate } from '../types';
import {
  User as UserIcon,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  Monitor,
  Terminal,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface CandidateProfilePageProps {
  currentUser: User | null;
  onStartExam: () => void;
  onOpenSystemCheck: () => void;
  onViewResults: () => void;
  onOpenCodingSandbox: () => void;
}

export const CandidateProfilePage: React.FC<CandidateProfilePageProps> = ({
  currentUser,
  onStartExam,
  onOpenSystemCheck,
  onViewResults,
  onOpenCodingSandbox,
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const candidateId = currentUser?.candidateId || 'INZ-CAND-2026-00001';
        const res = await api.getCandidateById(candidateId);
        if (res.success) {
          setCandidate(res.candidate);
        }
      } catch (err) {
        console.error('Failed to load candidate profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Loading Candidate Profile...</p>
      </div>
    );
  }

  const isCompleted = candidate?.assessmentStatus === 'Completed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A1128] to-[#101F42] text-white p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-sky-400 text-xs font-bold uppercase border border-blue-500/30">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Candidate Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {candidate?.fullName || currentUser?.fullName}!
          </h1>
          <p className="text-xs text-slate-300">
            Candidate ID: <strong className="font-mono text-sky-400">{candidate?.candidateId}</strong> • Applied Role:{' '}
            <strong>{candidate?.jobRoleTitle}</strong>
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              candidate?.recruitmentStage === 'Shortlisted'
                ? 'bg-blue-600 text-white shadow'
                : candidate?.recruitmentStage === 'Interview Scheduled'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-emerald-600 text-white'
            }`}
          >
            Stage: {candidate?.recruitmentStage || 'Assessment Pending'}
          </span>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 45-Question Assessment */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">45-Question Proctored Assessment</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              45-minute standard CBT exam: 15 Aptitude, 15 Communication, and 15 Domain Technical questions.
            </p>
          </div>

          <div className="pt-2">
            {isCompleted ? (
              <button
                onClick={onViewResults}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Evaluation Scorecard</span>
              </button>
            ) : (
              <button
                onClick={onStartExam}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5"
              >
                <span>Launch Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: System Diagnostic */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Hardware & Browser Check</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verify webcam feed, audio volume levels, display resolution, and network latency before testing.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenSystemCheck}
              className="w-full py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5"
            >
              <Monitor className="w-3.5 h-3.5 text-sky-600" />
              <span>Run Hardware Diagnostic</span>
            </button>
          </div>
        </div>

        {/* Card 3: Coding Assessment Sandbox */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Coding Practice Sandbox</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Test your algorithmic problem-solving in Python, JavaScript, and Java with automated test cases.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenCodingSandbox}
              className="w-full py-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center space-x-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open Code Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Profile Details Card */}
      {candidate && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Registered Profile & Academic Dossier</h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Identity Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-semibold">Candidate ID</span>
              <p className="font-mono font-bold text-blue-600 text-sm">{candidate.candidateId}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Affiliated Institution</span>
              <p className="font-bold text-slate-800">{candidate.collegeName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Degree & Department</span>
              <p className="font-bold text-slate-800">{candidate.degree}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Cumulative CGPA</span>
              <p className="font-bold text-slate-800">{candidate.cgpa} / 10</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Graduation Batch</span>
              <p className="font-bold text-slate-800">{candidate.graduationYear}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Standing Arrears</span>
              <p className="font-bold text-slate-800">{candidate.arrearStatus}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Applied Role</span>
              <p className="font-bold text-slate-800">{candidate.jobRoleTitle}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Domain Allocation</span>
              <p className="font-bold text-slate-800">{candidate.domainName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Recruitment Drive</span>
              <p className="font-bold text-slate-800">{candidate.driveId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
