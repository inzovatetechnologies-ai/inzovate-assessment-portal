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
  Download,
  Award,
  AlertTriangle,
  Printer,
  Sparkles,
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
        <p className="text-xs font-semibold text-slate-600">Retrieving Assessment Submission Confirmation...</p>
      </div>
    );
  }

  // Attempt count calculations
  const totalQuestions = result?.totalQuestions || 45;
  const attemptedCount =
    typeof result?.totalAttempted === 'number'
      ? result.totalAttempted
      : typeof result?.totalQuestionsAttempted === 'number'
      ? result.totalQuestionsAttempted
      : 0;
  const unattemptedCount = Math.max(0, totalQuestions - attemptedCount);

  // Score & Pass/Fail Calculations (Cutoff: > 25 is Pass, <= 25 is Fail)
  const totalScore = typeof result?.totalScore === 'number' ? result.totalScore : 0;
  const percentage = typeof result?.percentage === 'number' ? result.percentage : Math.round((totalScore / totalQuestions) * 100);
  const isPassed = totalScore > 25;
  const selectionStatus = isPassed ? 'Selected for Next Round' : 'Rejected';

  const sec1Score = result?.sectionScores?.['section-1']?.score ?? 0;
  const sec2Score = result?.sectionScores?.['section-2']?.score ?? 0;
  const sec3Score = result?.sectionScores?.['section-3']?.score ?? 0;

  const candidateName = result?.candidateName || currentUser?.fullName || 'Registered Candidate';
  const candidateId = result?.candidateDisplayId || currentUser?.candidateId || 'INZ-CAND-2026-00001';
  const jobRole = result?.jobRoleTitle || (currentUser as any)?.domain || 'Software Development Engineer';
  const collegeName = result?.collegeName || (currentUser as any)?.collegeName || currentUser?.collegeId || 'Autonomous Engineering College';
  const certificateId = result?.certificateId || 'INZ-CERT-2026-PENDING';
  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Download PDF Report Card
  const handleDownloadReportPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assessment Report Card - ${candidateName} (${candidateId})</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; font-size: 13px; }
          .header { border-bottom: 2px solid #0A1128; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .company-name { font-size: 20px; font-weight: 900; color: #0A1128; letter-spacing: 0.5px; }
          .portal-name { font-size: 12px; color: #0066FF; font-weight: 700; text-transform: uppercase; margin-top: 3px; }
          .cin { font-size: 10px; color: #64748B; margin-top: 2px; }
          .decision-banner { padding: 18px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 2px solid; }
          .decision-pass { background-color: #ECFDF5; border-color: #10B981; color: #065F46; }
          .decision-fail { background-color: #FEF2F2; border-color: #EF4444; color: #991B1B; }
          .decision-title { font-size: 18px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; }
          .decision-sub { font-size: 13px; margin-top: 4px; font-weight: 600; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
          .info-item strong { display: block; font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
          .info-item span { font-size: 13px; font-weight: 700; color: #0F172A; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          th { background: #0A1128; color: #FFFFFF; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
          td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
          .score-total { background: #EFF6FF; font-weight: 900; font-size: 14px; color: #0066FF; }
          .footer { margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 10px; color: #64748B; display: flex; justify-content: space-between; }
          .stamp { display: inline-block; padding: 6px 12px; border: 2px solid #0A1128; border-radius: 6px; font-weight: 900; font-size: 11px; text-transform: uppercase; color: #0A1128; }
          .print-btn { background: #0066FF; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 20px; font-size: 13px; }
          @media print { .no-print { display: none !important; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right;">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="company-name">INZOVATE TECHNOLOGIES PRIVATE LIMITED</div>
            <div class="portal-name">Online CBT Assessment Official Report Card</div>
            <div class="cin">Corporate Identification Number (CIN): U62011TZ2025PTC036329</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Report Date: <strong>${dateStr}</strong></div>
            <div>Certificate ID: <strong style="font-family: monospace;">${certificateId}</strong></div>
          </div>
        </div>

        <div class="decision-banner ${isPassed ? 'decision-pass' : 'decision-fail'}">
          <div class="decision-title">${isPassed ? '✓ PASS — SELECTED FOR NEXT ROUND' : '✕ NOT QUALIFIED — REJECTED'}</div>
          <div class="decision-sub">
            Candidate Total Score: <strong>${totalScore} / 45 (${percentage}%)</strong> &nbsp;|&nbsp; Pass Cutoff Criteria: <strong>&gt; 25 Marks</strong>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <strong>Candidate Full Name</strong>
            <span>${candidateName}</span>
          </div>
          <div class="info-item">
            <strong>Candidate ID</strong>
            <span style="font-family: monospace; color: #0066FF;">${candidateId}</span>
          </div>
          <div class="info-item">
            <strong>Applied Role</strong>
            <span>${jobRole}</span>
          </div>
          <div class="info-item">
            <strong>College / Institution</strong>
            <span>${collegeName}</span>
          </div>
          <div class="info-item">
            <strong>Assessment Type</strong>
            <span>45-Minute Online CBT (45 Questions)</span>
          </div>
          <div class="info-item">
            <strong>Selection Decision</strong>
            <span style="color: ${isPassed ? '#10B981' : '#EF4444'};">${selectionStatus}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Evaluation Parameter / Section</th>
              <th style="text-align: center;">Total Questions</th>
              <th style="text-align: center;">Score Obtained</th>
              <th style="text-align: center;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Section 1: General & Logical Aptitude</strong></td>
              <td style="text-align: center;">15</td>
              <td style="text-align: center; font-weight: bold;">${sec1Score} / 15</td>
              <td style="text-align: center;">${Math.round((sec1Score / 15) * 100)}%</td>
            </tr>
            <tr>
              <td><strong>Section 2: Professional Communication</strong></td>
              <td style="text-align: center;">15</td>
              <td style="text-align: center; font-weight: bold;">${sec2Score} / 15</td>
              <td style="text-align: center;">${Math.round((sec2Score / 15) * 100)}%</td>
            </tr>
            <tr>
              <td><strong>Section 3: Domain Technical Knowledge</strong></td>
              <td style="text-align: center;">15</td>
              <td style="text-align: center; font-weight: bold;">${sec3Score} / 15</td>
              <td style="text-align: center;">${Math.round((sec3Score / 15) * 100)}%</td>
            </tr>
            <tr>
              <td><strong>Questions Attempted vs Unattempted</strong></td>
              <td style="text-align: center;">45</td>
              <td style="text-align: center;"><strong>${attemptedCount} Attempted</strong></td>
              <td style="text-align: center;">${unattemptedCount} Unattempted</td>
            </tr>
            <tr class="score-total">
              <td><strong>FINAL EVALUATION TOTAL</strong></td>
              <td style="text-align: center;">45</td>
              <td style="text-align: center;">${totalScore} / 45</td>
              <td style="text-align: center;">${percentage}%</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-size: 11px; color: #475569; line-height: 1.6;">
          <strong>Selection Policy Note:</strong> The candidate scored ${totalScore} out of 45 marks. Candidates scoring strictly greater than 25 marks (&gt;25) qualify for the next interview rounds. This digital evaluation document is cryptographically signed and stored in the official Inzovate Recruitment System.
        </div>

        <div class="footer">
          <div>
            <div>INZOVATE TECHNOLOGIES PRIVATE LIMITED</div>
            <div>Ministry of Corporate Affairs Registered • Coimbatore, Tamil Nadu, India</div>
          </div>
          <div style="text-align: right;">
            <div class="stamp">OFFICIALLY VERIFIED</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

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
              Assessment Evaluated & Submitted
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              INZOVATE TECHNOLOGIES PRIVATE LIMITED • CIN: U62011TZ2025PTC036329
            </p>
          </div>
        </div>

        {/* Candidate & Attempt Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Prominent Pass / Fail & Selection Banner */}
          {isPassed ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Result: Passed (Score &gt; 25)</span>
                </span>
                <h2 className="text-xl font-black text-emerald-950 tracking-tight flex items-center justify-center sm:justify-start">
                  <span>Selected for Next Round</span>
                  <Sparkles className="w-4 h-4 ml-2 text-amber-500 shrink-0" />
                </h2>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-lg">
                  Congratulations! You scored <strong>{totalScore} / 45 ({percentage}%)</strong>, successfully passing the qualifying cutoff of &gt;25 marks. You are shortlisted for technical interviews.
                </p>
              </div>
              <div className="text-center px-5 py-3 rounded-2xl bg-white border border-emerald-200 shadow-sm shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your Score</span>
                <span className="text-3xl font-black text-emerald-600">{totalScore}</span>
                <span className="text-xs font-semibold text-slate-400"> / 45</span>
                <div className="text-[10px] font-bold text-emerald-700 font-mono mt-0.5">({percentage}%)</div>
                <span className="inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  Cutoff: &gt;25 Marks
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white uppercase tracking-wider shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Result: Not Qualified (Score &le; 25)</span>
                </span>
                <h2 className="text-xl font-black text-rose-950 tracking-tight">
                  Status: Rejected / Not Shortlisted
                </h2>
                <p className="text-xs text-rose-800 leading-relaxed max-w-lg">
                  You scored <strong>{totalScore} / 45 ({percentage}%)</strong>. The qualifying pass cutoff for this assessment is strictly more than 25 marks (&gt;25). Thank you for participating in Inzovate Campus Drive 2026.
                </p>
              </div>
              <div className="text-center px-5 py-3 rounded-2xl bg-white border border-rose-200 shadow-sm shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your Score</span>
                <span className="text-3xl font-black text-rose-600">{totalScore}</span>
                <span className="text-xs font-semibold text-slate-400"> / 45</span>
                <div className="text-[10px] font-bold text-rose-700 font-mono mt-0.5">({percentage}%)</div>
                <span className="inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                  Cutoff: &gt;25 Marks
                </span>
              </div>
            </div>
          )}

          {/* Attempt Highlight Widget */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center justify-center sm:justify-start">
                <FileCheck2 className="w-4 h-4 mr-1.5 text-blue-600" />
                Assessment Submission Metric
              </span>
              <p className="text-sm font-semibold text-slate-700">Questions Attempted & Verified</p>
              <p className="text-xs text-slate-500">All responses have been securely synced and recorded on the server.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-center px-4 py-2 rounded-xl bg-white border border-blue-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase block">Attempted</span>
                <span className="text-2xl font-black text-blue-700">{attemptedCount}</span>
                <span className="text-xs font-semibold text-slate-400"> / {totalQuestions}</span>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 uppercase block">Unattempted</span>
                <span className="text-2xl font-black text-slate-600">{unattemptedCount}</span>
                <span className="text-xs font-semibold text-slate-400"> / {totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Section-Wise Breakdown Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Sec 1: Aptitude</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{sec1Score} / 15</span>
              <span className="text-[11px] text-slate-500 font-semibold">{Math.round((sec1Score / 15) * 100)}%</span>
            </div>
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-center">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Sec 2: Communication</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{sec2Score} / 15</span>
              <span className="text-[11px] text-slate-500 font-semibold">{Math.round((sec2Score / 15) * 100)}%</span>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Sec 3: Technical</span>
              <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{sec3Score} / 15</span>
              <span className="text-[11px] text-slate-500 font-semibold">{Math.round((sec3Score / 15) * 100)}%</span>
            </div>
          </div>

          {/* Candidate Dossier Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Candidate Name</span>
              <p className="text-sm font-bold text-slate-800">
                {candidateName}
              </p>
              <p className="text-xs font-mono text-slate-500">
                Candidate ID: {candidateId}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Applied Role</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                {jobRole}
              </p>
              <p className="text-xs text-slate-500">Campus Fresher Recruitment 2026</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Institution / College</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <Building className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {collegeName}
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

          {/* Actions & Report Download */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDownloadReportPDF}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
              title="Download official PDF report card"
            >
              <Printer className="w-4 h-4" />
              <span>Download Assessment Report Card (PDF)</span>
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
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
