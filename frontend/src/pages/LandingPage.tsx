import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Domain } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Video,
  FileCheck2,
  Award,
  Users2,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronRight,
  Code2,
  Cpu,
  BarChart3,
  Palette,
  Cloud,
  Terminal,
  ShieldAlert,
  Smartphone,
  Megaphone,
  Briefcase,
} from 'lucide-react';

interface LandingPageProps {
  onStartRegistration: () => void;
  onOpenSystemCheck: () => void;
  onCandidateLogin: () => void;
  onVerifyCert: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 className="w-5 h-5 text-blue-600" />,
  BarChart3: <BarChart3 className="w-5 h-5 text-sky-600" />,
  Cpu: <Cpu className="w-5 h-5 text-purple-600" />,
  Palette: <Palette className="w-5 h-5 text-pink-600" />,
  Cloud: <Cloud className="w-5 h-5 text-cyan-600" />,
  Terminal: <Terminal className="w-5 h-5 text-emerald-600" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-rose-600" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
  Smartphone: <Smartphone className="w-5 h-5 text-indigo-600" />,
  Megaphone: <Megaphone className="w-5 h-5 text-amber-600" />,
  Briefcase: <Briefcase className="w-5 h-5 text-blue-700" />,
  Users2: <Users2 className="w-5 h-5 text-emerald-700" />,
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRegistration,
  onOpenSystemCheck,
  onCandidateLogin,
  onVerifyCert,
}) => {
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const domRes = await api.getDomains();
        if (domRes.success) setDomains(domRes.domains);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-[#0A1128] text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,102,255,0.25),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-2xl shadow-blue-500/30 border border-blue-400/40 flex items-center justify-center transform hover:scale-105 transition-all">
              <img src="/inzovate-logo.png" alt="Inzovate Technologies Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Inzovate Campus & Fresher Recruitment Portal 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Discover Your Potential. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-white">
              Demonstrate Your Skills.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Complete your recruitment assessment with Inzovate Technologies and demonstrate your aptitude, communication
            abilities and professional domain expertise through our secure, AI-proctored examination platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartRegistration}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Register for Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSystemCheck}
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <Monitor className="w-4 h-4 text-sky-400" />
              <span>Pre-Assessment System Check</span>
            </button>
            <button
              onClick={onCandidateLogin}
              className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-700/60 transition-all"
            >
              Candidate Login
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
            <div>
              <p className="text-2xl font-black text-white">45</p>
              <p className="text-xs text-slate-400 font-medium">Standard Questions</p>
            </div>
            <div>
              <p className="text-2xl font-black text-sky-400">15 / 15 / 15</p>
              <p className="text-xs text-slate-400 font-medium">3 Balanced Sections</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">12 Domains</p>
              <p className="text-xs text-slate-400 font-medium">35+ Technical Roles</p>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-400">100%</p>
              <p className="text-xs text-slate-400 font-medium">Proctored & Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Candidate Journey</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Simple 3-Step Recruitment Assessment Process
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            Follow our structured candidate workflow to participate in campus and fresher drives seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-sm mb-4 border border-blue-100">
              01
            </div>
            <h3 className="text-lg font-bold text-[#172033] mb-2">Register Your Profile</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Complete the 5-step registration wizard with academic records, resume PDF upload, and college drive ID to
              receive your unique Candidate ID.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>OTP verification & photo capture</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm relative hover:shadow-md transition-shadow ring-1 ring-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-extrabold flex items-center justify-center text-sm mb-4 border border-sky-100">
              02
            </div>
            <h3 className="text-lg font-bold text-[#172033] mb-2">Complete Your Assessment</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Take the 60-minute, 45-question CBT test with continuous webcam proctoring: 15 Aptitude, 15
              Communication, and 15 Role-specific Technical questions.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Auto-save & server synchronized timer</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-sm mb-4 border border-emerald-100">
              03
            </div>
            <h3 className="text-lg font-bold text-[#172033] mb-2">Get Results & Certificate</h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Receive automated server-side evaluation, sectional competency breakdown, and your verified digital
              assessment credential for HR shortlisting.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>QR verified scorecard & report</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Job Domains Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Domain Specializations</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              12 Supported Technical & Professional Domains
            </h2>
            <p className="text-slate-500 text-sm">
              Section 3 dynamically matches 15 technical questions tailored exclusively to your selected job role.
            </p>
          </div>
          <button
            onClick={onStartRegistration}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View all 35+ roles in registration</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {domains.map((domain) => (
            <div
              key={domain._id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {iconMap[domain.icon] || <Code2 className="w-5 h-5 text-blue-600" />}
              </div>
              <h3 className="font-bold text-sm text-[#172033] mb-1 group-hover:text-blue-600 transition-colors">
                {domain.name}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
                {domain.description}
              </p>
              <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                15 Technical Qs
              </span>
            </div>
          ))}
        </div>
      </section>



      {/* Examination Integrity & Technical Requirements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Examination Standards</span>
            <h2 className="text-2xl font-bold text-[#172033]">
              Desktop-Only Examination & AI Proctoring Standards
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              To ensure international examination integrity and fair technical evaluation, the Inzovate assessment
              platform enforces desktop-only compliance and continuous browser monitoring.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Desktop / Laptop Only:</strong> Minimum supported viewport 1280x720. Mobile devices are
                  strictly restricted.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Continuous Webcam Preview:</strong> Real-time browser media stream with active camera health
                  monitoring.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Cheating Detection:</strong> Tab switching, window blur, and full-screen exits trigger
                  proctoring warnings.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Server-Side Evaluation:</strong> Answer keys are never sent to the client. Scoring is executed
                  authoritatively on the backend.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenSystemCheck}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-2 shadow transition-colors"
              >
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Run Hardware Diagnostics Now</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Assessment Architecture Matrix
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono font-semibold">
                SECURE CBT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Examination Duration</span>
                <span className="font-bold text-white">60 Minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Section 1: Aptitude & Reasoning</span>
                <span className="font-bold text-sky-400">15 Questions (15 Marks)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Section 2: Professional Communication</span>
                <span className="font-bold text-sky-400">15 Questions (15 Marks)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Section 3: Domain Technical Knowledge</span>
                <span className="font-bold text-sky-400">15 Questions (15 Marks)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Marks</span>
                <span className="font-bold text-emerald-400">45 Marks</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Shortlisting Threshold</span>
                <span className="font-bold text-amber-400">60% (27 Marks)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
