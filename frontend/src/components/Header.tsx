import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import {
  User as UserIcon,
  LogOut,
  Monitor,
  Lock,
  Eye,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  isAdmin: boolean;
  isExamCompleted?: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCandidateLogin: () => void;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdmin,
  isExamCompleted = false,
  activeTab,
  onSelectTab,
  onOpenCandidateLogin,
  onOpenAdminLogin,
  onLogout,
}) => {
  const isCandidate = currentUser && currentUser.role === 'Candidate';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  const companyEmail = 'hr@inzovate-technologies.com';
  const displayEmail = currentUser ? (currentUser.email || currentUser.candidateId || companyEmail) : companyEmail;

  // Close contact dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setContactMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleNavClick = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pointer-events-none flex flex-col items-center pt-4 sm:pt-6 pb-2 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Centered Floating Pill Navigation Bar */}
      <div className="pointer-events-auto bg-[#121214] text-white border border-white/10 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl py-2 px-2.5 sm:px-3 flex items-center justify-between gap-3 sm:gap-6 max-w-4xl w-full transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] hover:border-white/15">
        
        {/* 1. LOGO SECTION: Small circular white container on extreme left */}
        <div
          onClick={() => handleNavClick(isAdmin ? 'admin-dash' : isCandidate ? 'candidate-dash' : 'home')}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          title="Inzovate Technologies"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-2 shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0 overflow-hidden">
            <img
              src="/inzovate-logo.png"
              alt="Inzovate Technologies"
              className="w-full h-full object-contain transform transition-transform duration-300 group-hover:rotate-6"
            />
          </div>
          <span className="hidden xl:inline text-xs font-black tracking-widest text-white uppercase font-sans pr-1">
            INZOVATE
          </span>
        </div>

        {/* 2. NAVIGATION MENU: Desktop / Tablet horizontal links with modern typography */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {!currentUser && (
            <>
              <button
                onClick={() => handleNavClick('home')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'home'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'register'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Registration
              </button>
              <button
                onClick={() => handleNavClick('system-check')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'system-check'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Diagnostic
              </button>
              <button
                onClick={() => handleNavClick('verify-cert')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'verify-cert'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Verify
              </button>
              <button
                onClick={onOpenCandidateLogin}
                className="text-[13px] font-medium tracking-normal text-sky-400 hover:text-sky-300 transition-colors duration-200 flex items-center space-x-1"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </>
          )}

          {/* Candidate Logged In Menu */}
          {isCandidate && (
            <>
              <button
                onClick={() => handleNavClick('candidate-dash')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'candidate-dash'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Portal
              </button>
              <button
                onClick={() => handleNavClick('system-check')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'system-check'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Diagnostic
              </button>
              {!isExamCompleted ? (
                <button
                  onClick={() => handleNavClick('exam')}
                  className={`text-[13px] font-bold tracking-normal transition-colors duration-200 flex items-center space-x-1.5 px-3 py-1 rounded-full ${
                    activeTab === 'exam'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Start Test</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('candidate-result')}
                  className={`text-[13px] font-bold tracking-normal transition-colors duration-200 flex items-center space-x-1.5 px-3 py-1 rounded-full ${
                    activeTab === 'candidate-result'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Result Ready</span>
                </button>
              )}
            </>
          )}

          {/* Admin Logged In Menu */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleNavClick('admin-dash')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 relative py-1 ${
                  activeTab === 'admin-dash'
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('live-proctoring')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 flex items-center space-x-1.5 ${
                  activeTab === 'live-proctoring' ? 'text-rose-400 font-bold' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Proctoring</span>
              </button>
              <button
                onClick={() => handleNavClick('question-bank')}
                className={`text-[13px] font-medium tracking-normal transition-colors duration-200 flex items-center space-x-1.5 ${
                  activeTab === 'question-bank' ? 'text-amber-300 font-bold' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Question Bank</span>
              </button>
            </>
          )}
        </nav>

        {/* 3. CONTACT / EMAIL BUTTON: White pill-shaped button on extreme right */}
        <div className="relative flex items-center space-x-2 shrink-0" ref={contactRef}>
          <button
            type="button"
            onClick={() => setContactMenuOpen(!contactMenuOpen)}
            className="rounded-full bg-white hover:bg-neutral-100 text-[#121212] font-semibold text-[13px] px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center space-x-2 shrink-0 cursor-pointer"
            title={currentUser ? `User: ${displayEmail}` : `Inzovate: ${companyEmail}`}
          >
            {currentUser ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
            ) : null}
            <span className="truncate max-w-[140px] sm:max-w-[240px] md:max-w-[260px]">{displayEmail}</span>
          </button>

          {/* Quick Action Dropdown Menu upon clicking the Contact / Email Pill */}
          {contactMenuOpen && (
            <div className="absolute top-13 right-0 w-72 bg-[#18181B] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {currentUser ? 'Active Session' : 'Official Contact & Access'}
                </span>
                <button
                  onClick={() => setContactMenuOpen(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Email Address with 1-Click Copy */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">Official Email</span>
                  <button
                    onClick={handleCopyEmail}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono text-white text-xs select-all font-semibold">{displayEmail}</p>
              </div>

              {/* Action Buttons inside Dropdown */}
              <div className="space-y-1.5 pt-1">
                <a
                  href={`mailto:${displayEmail}`}
                  className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Send Direct Email</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                </a>

                {!currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        setContactMenuOpen(false);
                        onOpenCandidateLogin();
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-between transition-colors shadow"
                    >
                      <span className="flex items-center space-x-2">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Candidate Sign In</span>
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        setContactMenuOpen(false);
                        onOpenAdminLogin();
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center justify-between transition-colors border border-white/5"
                    >
                      <span className="flex items-center space-x-2">
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Administrator Portal</span>
                      </span>
                      <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
                        Alt+A
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setContactMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between transition-colors border border-rose-500/20"
                  >
                    <span className="flex items-center space-x-2">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out Securely</span>
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-neutral-400 text-center">
                CIN: <span className="font-mono text-neutral-300">U62011TZ2025PTC036329</span>
              </div>
            </div>
          )}

          {/* Quick Sign Out Circle Button for Logged-In Users */}
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              title="Log Out Securely"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500/25 text-neutral-300 hover:text-rose-400 flex items-center justify-center transition-all border border-white/5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 border border-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden w-full max-w-sm mt-3 bg-[#121214]/95 border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              Navigation Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col space-y-1 text-sm font-medium">
            {!currentUser && (
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'home' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'register' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Candidate Registration
                </button>
                <button
                  onClick={() => handleNavClick('system-check')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'system-check' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  System Diagnostic
                </button>
                <button
                  onClick={() => handleNavClick('verify-cert')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'verify-cert' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Verify Certificate
                </button>
                <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCandidateLogin();
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Candidate Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-white/10"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Admin Portal</span>
                  </button>
                </div>
              </>
            )}

            {isCandidate && (
              <>
                <button
                  onClick={() => handleNavClick('candidate-dash')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'candidate-dash' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Candidate Portal
                </button>
                <button
                  onClick={() => handleNavClick('system-check')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'system-check' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Hardware Test
                </button>
                {!isExamCompleted ? (
                  <button
                    onClick={() => handleNavClick('exam')}
                    className="text-left px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Start 45-Q Assessment</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('candidate-result')}
                    className="text-left px-3.5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center space-x-2 border border-emerald-500/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>View Submission Result</span>
                  </button>
                )}
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('admin-dash')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'admin-dash' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Admin Command Center
                </button>
                <button
                  onClick={() => handleNavClick('live-proctoring')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'live-proctoring' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Live Proctoring
                </button>
                <button
                  onClick={() => handleNavClick('question-bank')}
                  className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'question-bank' ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  Question Bank
                </button>
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
