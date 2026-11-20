import React from 'react';
import {
  ShieldCheck,
  Lock,
  Award,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle2,
  FileText,
  Cpu,
  Sparkles,
  Server,
  Zap,
  ExternalLink,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070D1E] text-slate-400 border-t border-slate-800 text-xs mt-auto font-sans">
      {/* 1. TOP ENTERPRISE TRUST & COMPLIANCE BANNER */}
      <div className="border-b border-slate-800/80 py-4 bg-[#0A1128]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] font-medium">
            <span className="flex items-center space-x-1.5 text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Govt. of India MCA Registered</span>
              <span className="font-mono font-bold text-white ml-1">CIN: U62011TZ2025PTC036329</span>
            </span>

            <span className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Live Continuous Webcam Proctoring</span>
            </span>

            <span className="flex items-center space-x-1.5 text-blue-400">
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256 Storage & TLS 1.3 Transport Encryption</span>
            </span>

            <span className="hidden lg:flex items-center space-x-1.5 text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
              <span>High-Concurrency Engine (5,000+ Concurrent Candidates)</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-bold">CBT Cloud Services: Operational</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-400">v2.0 Enterprise</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN MEGA-FOOTER NAVIGATION GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* COLUMN 1: CORPORATE IDENTITY & LOGO (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-xl shadow-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                <img
                  src="/inzovate-logo.png"
                  alt="INZOVATE Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  INZOVATE TECHNOLOGIES
                </span>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                  Private Limited
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Enterprise AI-assisted online examination, automated skill evaluation, and candidate intelligence platform engineered for pan-India campus recruitment and institutional hiring.
            </p>

            {/* MCA Statutory Registration Box */}
            <div className="p-3 rounded-xl bg-[#0F1B38] border border-blue-500/20 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Corporate Identity Number (CIN):</span>
                <span className="font-mono font-bold text-sky-300">U62011TZ2025PTC036329</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Company Type: Private Limited (Non-Govt)</span>
                <span>RoC: Coimbatore, Tamil Nadu</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] pt-1 border-t border-slate-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ministry of Corporate Affairs (MCA) Registered Entity</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Assessment Gateway: </span>
              <span className="text-sky-400 font-mono">assessment.inzovate-technologies.com</span>
            </div>
          </div>

          {/* COLUMN 2: EXAMINATION MODULES & CBT MATRIX (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>CBT Assessment Structure</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start space-x-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <span><strong>Section 1:</strong> Aptitude & Logical Reasoning (15 Questions)</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Section 2:</strong> Verbal & Professional Communication (15 Questions)</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span><strong>Section 3:</strong> Technical Domain Specialization (15 Questions)</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></span>
                <span>Pre-Assessment 6-Point Hardware Diagnostic</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></span>
                <span>Real-Time Tab Switch & Window Blur Detection</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></span>
                <span>Instant Score Evaluation & Cryptographic QR Verification</span>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SECURITY, INTEGRITY & POLICIES (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compliance & Security</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="hover:text-white transition-colors cursor-pointer">Candidate Code of Conduct</li>
              <li className="hover:text-white transition-colors cursor-pointer">Webcam & Audio Privacy Notice</li>
              <li className="hover:text-white transition-colors cursor-pointer">Desktop-Only Assessment Rule</li>
              <li className="hover:text-white transition-colors cursor-pointer">Anti-Cheating Disqualification Standard</li>
              <li className="hover:text-white transition-colors cursor-pointer">ISO 27001 Security Alignment</li>
              <li className="hover:text-white transition-colors cursor-pointer">Candidate Data Retention Policy</li>
            </ul>
          </div>

          {/* COLUMN 4: CORPORATE CONTACT & HEADQUARTERS (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Corporate Desk</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Registered Office:</strong><br />
                  INZOVATE TECHNOLOGIES PRIVATE LIMITED<br />
                  Bhavani, Coimbatore and Salem, Tamil Nadu, India.
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate font-semibold text-sky-300">hr@inzovate-technologies.com</span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">support@inzovate-technologies.com</span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">admin@inzovate-technologies.com</span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <a href="tel:+919342008797" className="hover:text-white transition-colors font-medium">+91 93420 08797</a>
              </div>


            </div>
          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="space-y-0.5 text-center md:text-left">
            <p className="text-slate-400 font-medium">
              © 2026 <strong className="text-white">INZOVATE TECHNOLOGIES PRIVATE LIMITED</strong>. All Rights Reserved.
            </p>
            <p className="text-slate-500 font-mono text-[10px]">
              Corporate Identification Number (CIN): <span className="text-sky-400 font-semibold">U62011TZ2025PTC036329</span> • Registered under Companies Act, 2013
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              CBT Version 2.0
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
              Hostinger Enterprise + Cloudflare Edge
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-400">
              MongoDB Atlas Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
