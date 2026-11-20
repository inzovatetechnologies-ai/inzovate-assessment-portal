import React from 'react';
import { AssessmentResult } from '../types';
import { ShieldCheck, Award, Printer, CheckCircle2, QrCode, Download } from 'lucide-react';

interface CertificateViewProps {
  result: AssessmentResult;
  onClose?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ result, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-w-4xl mx-auto my-6 print:m-0 print:border-none print:shadow-none">
      {/* Action Header (Hidden in Print) */}
      <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <span className="font-semibold text-sm">Official Inzovate Assessment Credential</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs font-medium px-2 py-1"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Official Certificate Border & Design */}
      <div className="p-8 sm:p-12 relative bg-gradient-to-b from-slate-50/50 via-white to-blue-50/20 border-8 border-double border-slate-200 m-4 rounded-lg">
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <ShieldCheck className="w-[450px] h-[450px] text-blue-900" />
        </div>

        {/* Top Header */}
        <div className="text-center space-y-2 pb-6 border-b border-slate-200">
          <div className="flex justify-center mb-1">
            <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 shadow-md flex items-center justify-center">
              <img src="/inzovate-logo.png" alt="Inzovate Technologies" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide uppercase">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Enterprise Talent Assessment Credential</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            INZOVATE TECHNOLOGIES PRIVATE LIMITED
          </h1>
          <p className="text-xs text-slate-500 tracking-wider uppercase font-semibold">
            Talent Acquisition & Assessment Council • CIN: U62011TZ2025PTC036329
          </p>
        </div>

        {/* Certification Statement */}
        <div className="text-center my-8 space-y-3">
          <p className="text-sm font-serif italic text-slate-600">This official assessment report confirms that</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101F42] tracking-tight border-b-2 border-slate-800 inline-block pb-1 px-4">
            {result.candidateName}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Candidate ID: <span className="font-bold text-slate-800">{result.candidateDisplayId}</span>
          </p>
          <p className="text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed pt-2">
            has successfully completed the comprehensive, proctored 45-question online recruitment examination for the position of{' '}
            <strong className="text-blue-700 font-bold">{result.jobRoleTitle}</strong> representing{' '}
            <strong>{result.collegeName}</strong>.
          </p>
        </div>

        {/* Score & Evaluation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Score</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {result.totalScore} <span className="text-xs font-normal text-slate-500">/ {result.maxScore}</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Aggregate Percentage</p>
            <p className="text-2xl font-black text-blue-800 mt-1">{result.percentage}%</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Performance Rating</p>
            <p className="text-lg font-bold text-emerald-800 mt-1 truncate">{result.performanceCategory}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Integrity & Proctoring</p>
            <div className="flex items-center justify-center space-x-1 mt-1 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified ({result.violationsCount || 0} Flags)</span>
            </div>
          </div>
        </div>

        {/* Detailed Sectional Performance */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 my-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Section-Wise Performance Breakdown (15 Questions Each)
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Section 1: Aptitude & Logical Reasoning</span>
                <span className="font-bold">{result.sectionScores.section1.score} / 15 ({result.sectionScores.section1.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${result.sectionScores.section1.percentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Section 2: Professional Communication Assessment</span>
                <span className="font-bold">{result.sectionScores.section2.score} / 15 ({result.sectionScores.section2.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${result.sectionScores.section2.percentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Section 3: Domain Technical ({result.jobRoleTitle})</span>
                <span className="font-bold">{result.sectionScores.section3.score} / 15 ({result.sectionScores.section3.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${result.sectionScores.section3.percentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Signatures & QR Authentication */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 items-end">
          {/* QR Code and Verification */}
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white border border-slate-300 rounded flex items-center justify-center p-1 shadow-sm">
              <QrCode className="w-14 h-14 text-slate-800" />
            </div>
            <div className="text-[10px] space-y-0.5 text-slate-500 font-mono">
              <p className="font-bold text-slate-800">DIGITAL CERTIFICATE</p>
              <p>ID: {result.certificateId}</p>
              <p>HASH: {result.verificationHash}</p>
              <p>Issued: {result.assessmentDate}</p>
            </div>
          </div>

          {/* Official Seal */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600 mx-auto flex items-center justify-center text-[9px] font-bold text-blue-900 uppercase p-1 leading-tight text-center">
              Official Assessment Seal
            </div>
          </div>

          {/* Signatures */}
          <div className="text-right space-y-1">
            <p className="font-serif italic text-base text-slate-800 font-bold">Vikram Malhotra</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dr. Vikram Malhotra</p>
            <p className="text-[10px] text-slate-500">Chief Executive & Head of Assessment</p>
            <p className="text-[9px] text-slate-400">INZOVATE TECHNOLOGIES PVT LTD</p>
          </div>
        </div>
      </div>
    </div>
  );
};
