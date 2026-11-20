import React, { useState } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  QrCode,
  Calendar,
  Building,
  Briefcase,
  User,
} from 'lucide-react';

export const CertificateVerifyPage: React.FC = () => {
  const [certId, setCertId] = useState('INZ-CERT-2026-89412');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setCertData(null);

    try {
      const res = await api.verifyCertificate(certId.trim());
      if (res.success && res.certificate) {
        setCertData(res.certificate);
      } else {
        setErrorMsg('Invalid Certificate ID. No matching assessment record found.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Official Public Credential Ledger</span>
        </div>
        <h1 className="text-3xl font-black text-[#0A1128] tracking-tight">
          Verify Inzovate Talent Assessment Certificate
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Enter the unique Certificate ID printed on the candidate's assessment report to verify authentic score records
          and proctoring integrity directly from the database.
        </p>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Certificate ID / Verification Number *
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="e.g. INZ-CERT-2026-89412"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{loading ? 'Authenticating with Ledger...' : 'Verify Assessment Record'}</span>
        </button>
      </form>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verified Certificate Result Card */}
      {certData && (
        <div className="bg-white p-8 rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Official Authenticated Record</h3>
                <p className="text-[11px] text-emerald-700 font-semibold">{certData.status}</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500">{certData.certificateId}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Candidate Name</span>
              <p className="font-bold text-slate-900 text-sm">{certData.candidateName}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Candidate ID</span>
              <p className="font-mono font-bold text-blue-600">{certData.candidateDisplayId}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">College / University</span>
              <p className="font-bold text-slate-800">{certData.collegeName}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Assessed Job Role</span>
              <p className="font-bold text-slate-800">{certData.jobRoleTitle}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Assessment Score</span>
              <p className="font-bold text-slate-900 font-mono">
                {certData.totalScore} / {certData.maxScore} ({certData.percentage}%)
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-semibold">Performance Rating</span>
              <p className="font-bold text-emerald-700">{certData.performanceCategory}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500 space-y-1">
            <p>
              <strong className="text-slate-700">Cryptographic Signature: </strong> {certData.verificationHash}
            </p>
            <p>
              <strong className="text-slate-700">Issuing Authority: </strong> {certData.issuingOrganization}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
