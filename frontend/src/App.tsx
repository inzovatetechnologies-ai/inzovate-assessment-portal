import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Modals
import { CandidateLoginModal } from './components/CandidateLoginModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AdminLoginModal } from './components/AdminLoginModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { SystemCheckPage } from './pages/SystemCheckPage';
import { ExamInterface } from './pages/ExamInterface';
import { CandidateResultPage } from './pages/CandidateResultPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { HRDashboard } from './pages/HRDashboard';
import { LiveProctoringPage } from './pages/LiveProctoringPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { CodingSandboxPage } from './pages/CodingSandboxPage';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('inzovate_user');
      const savedToken = localStorage.getItem('inzovate_token');
      if (savedUser && savedToken) return JSON.parse(savedUser);
    } catch (e) {}
    return null;
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedTab = sessionStorage.getItem('inzovate_active_tab');
      const hasUser = Boolean(localStorage.getItem('inzovate_user') && localStorage.getItem('inzovate_token'));
      if (savedTab === 'exam' && !hasUser) return 'home';
      if (savedTab) return savedTab;
    } catch (e) {}
    return 'home';
  });
  const [examResultData, setExamResultData] = useState<any>(null);
  const [isExamCompleted, setIsExamCompleted] = useState<boolean>(() => {
    return localStorage.getItem('inzovate_exam_completed') === 'true';
  });

  // Authentication Modals
  const [candidateLoginOpen, setCandidateLoginOpen] = useState(false);
  const [candidateLoginInitialIdentifier, setCandidateLoginInitialIdentifier] = useState('');
  const [candidateLoginInitialPassword, setCandidateLoginInitialPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordInitialIdentifier, setForgotPasswordInitialIdentifier] = useState('');
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  // Persist active tab across page refreshes & restore session on startup
  useEffect(() => {
    try {
      sessionStorage.setItem('inzovate_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    const savedUser = localStorage.getItem('inzovate_user');
    const savedToken = localStorage.getItem('inzovate_token');
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        if (user.role === 'Admin' && activeTab === 'home') {
          setActiveTab('admin-dash');
        }
      } catch (e) {
        localStorage.removeItem('inzovate_user');
        localStorage.removeItem('inzovate_token');
        setCurrentUser(null);
      }
    }
  }, []);

  // Instant Strict Scroll-To-Top on Initial Mount, Page Show, and Window Load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const forceScrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceScrollToTop();
    window.addEventListener('load', forceScrollToTop);
    window.addEventListener('pageshow', forceScrollToTop);

    return () => {
      window.removeEventListener('load', forceScrollToTop);
      window.removeEventListener('pageshow', forceScrollToTop);
    };
  }, []);

  // Strict Instant Scroll-To-Top whenever activeTab (page navigation) changes
  useEffect(() => {
    const forceScrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    forceScrollToTop();
    const rafId = requestAnimationFrame(forceScrollToTop);
    const timer = setTimeout(forceScrollToTop, 30);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [activeTab]);

  // Global Keyboard Shortcut: Press Alt + A or Ctrl + Shift + A to open Admin Login Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        setAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCandidateLoginSuccess = (user: any, token: string) => {
    const normalizedUser: User = {
      id: user.id || user._id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: 'Candidate',
      candidateId: user.candidateId,
      collegeId: user.collegeId,
      department: user.department,
      ...(user.jobRoleId ? { jobRoleId: user.jobRoleId } : {}),
      ...(user.jobRoleTitle ? { jobRoleTitle: user.jobRoleTitle } : {}),
      ...(user.domainId ? { domainId: user.domainId } : {}),
      ...(user.domainName ? { domainName: user.domainName } : {}),
      ...(user.collegeName ? { collegeName: user.collegeName } : {}),
    };
    setCurrentUser(normalizedUser);
    setExamResultData(null);
    localStorage.setItem('inzovate_user', JSON.stringify(normalizedUser));
    localStorage.setItem('inzovate_token', token);

    if (user.assessmentStatus === 'Completed' || (user.totalScore !== null && user.totalScore !== undefined)) {
      setIsExamCompleted(true);
      localStorage.setItem('inzovate_exam_completed', 'true');
    } else {
      setIsExamCompleted(false);
      localStorage.removeItem('inzovate_exam_completed');
      localStorage.removeItem('inzovate_session_id');
    }

    setActiveTab('candidate-dash');
  };

  const handleAdminLoginSuccess = (adminUser: any, token: string) => {
    const normalizedAdmin: User = {
      id: adminUser.id || 'admin-01',
      fullName: adminUser.fullName || 'Lead Administrator',
      email: adminUser.email || 'admin@inzovate-technologies.com',
      role: 'Admin',
    };
    setCurrentUser(normalizedAdmin);
    localStorage.setItem('inzovate_user', JSON.stringify(normalizedAdmin));
    localStorage.setItem('inzovate_token', token);
    setActiveTab('admin-dash');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setExamResultData(null);
    setIsExamCompleted(false);
    localStorage.removeItem('inzovate_user');
    localStorage.removeItem('inzovate_token');
    localStorage.removeItem('inzovate_exam_completed');
    localStorage.removeItem('inzovate_session_id');
    try {
      sessionStorage.removeItem('inzovate_active_tab');
      sessionStorage.removeItem('inzovate_reg_success');
    } catch (e) {}
    setActiveTab('home');
  };

  const handleRegistrationSuccess = (candidate: any) => {
    if (candidate) {
      handleCandidateLoginSuccess(candidate, 'inz_session_direct');
      setActiveTab('system-check');
    } else {
      setActiveTab('home');
      setCandidateLoginOpen(true);
    }
  };

  const handleOpenCandidateLogin = (initialId?: string, initialPw?: string) => {
    if (initialId) setCandidateLoginInitialIdentifier(initialId);
    if (initialPw) setCandidateLoginInitialPassword(initialPw);
    setActiveTab('home');
    setCandidateLoginOpen(true);
  };

  const handleExamComplete = (result: any) => {
    setExamResultData(result);
    setIsExamCompleted(true);
    localStorage.setItem('inzovate_exam_completed', 'true');
    setActiveTab('candidate-result');
  };

  // Guarded tab switcher
  const handleSelectTab = (tab: string) => {
    // If assessment is already completed, do not allow re-entering the exam interface
    if (tab === 'exam' && isExamCompleted) {
      setActiveTab('candidate-result');
      return;
    }

    // If accessing candidate-only tabs without candidate login
    if ((tab === 'candidate-dash' || tab === 'exam') && (!currentUser || currentUser.role !== 'Candidate')) {
      setCandidateLoginOpen(true);
      return;
    }

    // If accessing admin-only tabs without admin login
    if (
      (tab === 'admin-dash' || tab === 'live-proctoring' || tab === 'question-bank' || tab === 'hr-dash') &&
      (!currentUser || currentUser.role !== 'Admin')
    ) {
      setAdminLoginOpen(true);
      return;
    }

    setActiveTab(tab);
  };

  const isAdmin = Boolean(currentUser && currentUser.role === 'Admin');
  const isCandidate = Boolean(currentUser && currentUser.role === 'Candidate');

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] text-[#172033] font-sans antialiased">
      {/* Top Enterprise Header (Hidden during active CBT examination to maximize candidate concentration) */}
      {activeTab !== 'exam' && (
        <Header
          currentUser={currentUser}
          isAdmin={isAdmin}
          isExamCompleted={isExamCompleted}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenCandidateLogin={() => setCandidateLoginOpen(true)}
          onOpenAdminLogin={() => setAdminLoginOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Routing Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            onStartRegistration={() => setActiveTab('register')}
            onOpenSystemCheck={() => setActiveTab('system-check')}
            onCandidateLogin={() => setCandidateLoginOpen(true)}
            onVerifyCert={() => setActiveTab('verify-cert')}
          />
        )}

        {activeTab === 'register' && (
          <RegistrationPage
            onRegistrationSuccess={handleRegistrationSuccess}
            onCancel={() => setActiveTab('home')}
            onOpenLogin={(initialId, initialPw) => {
              handleOpenCandidateLogin(initialId, initialPw);
            }}
          />
        )}

        {activeTab === 'system-check' && (
          <SystemCheckPage
            onProceedToAssessment={() => {
              if (isExamCompleted) {
                setActiveTab('candidate-result');
              } else if (isCandidate) {
                setActiveTab('exam');
              } else {
                setCandidateLoginOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'candidate-dash' && (
          <CandidateProfilePage
            currentUser={currentUser}
            onStartExam={() => {
              if (isExamCompleted) {
                setActiveTab('candidate-result');
              } else {
                setActiveTab('exam');
              }
            }}
            onOpenSystemCheck={() => setActiveTab('system-check')}
            onViewResults={() => setActiveTab('candidate-result')}
            onOpenCodingSandbox={() => setActiveTab('coding-sandbox')}
          />
        )}

        {activeTab === 'exam' && (
          currentUser ? (
            <ExamInterface currentUser={currentUser} onExamComplete={handleExamComplete} />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <p className="text-sm font-semibold text-slate-700">Please sign in with your Candidate ID or Email to launch the assessment.</p>
              <button
                onClick={() => { setActiveTab('home'); setCandidateLoginOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                Open Candidate Sign In
              </button>
            </div>
          )
        )}

        {activeTab === 'candidate-result' && (
          <CandidateResultPage
            currentUser={currentUser}
            resultData={examResultData}
            onNavigateHome={() => setActiveTab('candidate-dash')}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'admin-dash' && <AdminDashboard />}

        {activeTab === 'hr-dash' && <HRDashboard />}

        {activeTab === 'live-proctoring' && <LiveProctoringPage />}

        {activeTab === 'question-bank' && <QuestionBankPage />}

        {activeTab === 'coding-sandbox' && <CodingSandboxPage />}

        {activeTab === 'verify-cert' && <CertificateVerifyPage />}
      </main>

      {/* Footer (Hidden during CBT exam) */}
      {activeTab !== 'exam' && <Footer />}

      {/* Authentication Modals */}
      <CandidateLoginModal
        isOpen={candidateLoginOpen}
        initialIdentifier={candidateLoginInitialIdentifier}
        initialPassword={candidateLoginInitialPassword}
        onClose={() => {
          setCandidateLoginOpen(false);
          setCandidateLoginInitialIdentifier('');
          setCandidateLoginInitialPassword('');
        }}
        onLoginSuccess={handleCandidateLoginSuccess}
        onOpenRegister={() => {
          setCandidateLoginOpen(false);
          setActiveTab('register');
        }}
        onOpenForgotPassword={(initialId) => {
          setCandidateLoginOpen(false);
          setForgotPasswordInitialIdentifier(initialId || '');
          setForgotPasswordOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        initialIdentifier={forgotPasswordInitialIdentifier}
        onClose={() => setForgotPasswordOpen(false)}
        onProceedToLogin={() => {
          setForgotPasswordOpen(false);
          setCandidateLoginOpen(true);
        }}
      />

      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
