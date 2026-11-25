import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Question, User } from '../types';
import { WebcamFeed } from '../components/WebcamFeed';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Send,
  Maximize2,
  Eye,
  Wifi,
  HelpCircle,
} from 'lucide-react';

interface ExamInterfaceProps {
  currentUser: User | null;
  onExamComplete: (result: any) => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({ currentUser, onExamComplete }) => {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [candidateMeta, setCandidateMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState<'section-1' | 'section-2' | 'section-3'>('section-1');

  // Answers & Status state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);

  // Timer & Security
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(45 * 60);
  const [violationsCount, setViolationsCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const violationsCountRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const lastTabSwitchMsRef = useRef(0);
  const [violationModal, setViolationModal] = useState<{ open: boolean; message: string; count: number } | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingOrDoneRef = useRef(false);
  const [initError, setInitError] = useState<{ isCompleted?: boolean; message: string; candidate?: any } | null>(null);

  // Initialize Exam Session
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    async function initSession() {
      setLoading(true);
      setInitError(null);
      try {
        let cid = currentUser?.candidateId || (currentUser?.role === 'Candidate' ? currentUser?.id : undefined);
        let cEmail = currentUser?.email;
        let cRoleId = (currentUser as any)?.jobRoleId;
        if (!cid || !cEmail || !cRoleId) {
          const sources = [
            () => localStorage.getItem('inzovate_user'),
            () => localStorage.getItem('inzovate_last_candidate'),
            () => {
              const reg = sessionStorage.getItem('inzovate_reg_success');
              if (!reg) return null;
              const parsed = JSON.parse(reg);
              return JSON.stringify(parsed.candidateObj || parsed);
            }
          ];
          for (const getRaw of sources) {
            try {
              const saved = getRaw();
              if (saved) {
                const u = JSON.parse(saved);
                if (!cid) cid = u.candidateId || u.id;
                if (!cEmail) cEmail = u.email;
                if (!cRoleId) cRoleId = u.jobRoleId;
              }
            } catch (e) {}
          }
        }
        if (!cid && !cEmail) {
          setInitError({
            isCompleted: false,
            message: 'Candidate session not found. Please sign in with your Candidate ID or registered Email before starting the assessment.',
          });
          setLoading(false);
          return;
        }

        const res = await api.startExam(cid, cEmail, cRoleId);
        if (res.success && res.session && res.session.questions && res.session.questions.length > 0) {
          const s = res.session;
          setSessionId(s.sessionId);
          if (s.sessionId) {
            localStorage.setItem('inzovate_session_id', s.sessionId);
          }
          setCandidateMeta(s.candidate);
          setQuestions(s.questions);
          setAnswers(s.savedAnswers || {});
          setMarkedForReview(s.markedForReview || []);
          setTimeRemainingSeconds(s.timeRemainingSeconds || 2700);
          setViolationsCount(s.violationsCount || 0);

          // Mark first question visited
          if (s.questions.length > 0) {
            setVisited({ [s.questions[0]._id]: true });
          }
        } else {
          const msg = res.message || 'Unable to retrieve assessment session.';
          const isComp = Boolean(res.isCompleted || msg.includes('already been completed') || msg.includes('terminated'));
          setInitError({
            isCompleted: isComp,
            message: msg,
            candidate: res.candidate || candidateMeta || currentUser,
          });
          if (isComp) {
            localStorage.setItem('inzovate_exam_completed', 'true');
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize assessment session:', err);
        setInitError({
          isCompleted: false,
          message: err.message || 'Network error initializing CBT assessment session.',
        });
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [currentUser]);

  const handleResetAttempt = async () => {
    const targetCid = candidateMeta?.id || currentUser?.candidateId || initError?.candidate?.id;
    if (!targetCid) return;
    try {
      setLoading(true);
      const resetRes = await api.resetExamAttempt(targetCid);
      if (resetRes.success) {
        localStorage.removeItem('inzovate_exam_completed');
        setInitError(null);
        window.location.reload();
      } else {
        alert(resetRes.message || 'Failed to reset attempt.');
      }
    } catch (e: any) {
      alert(e.message || 'Reset error');
    } finally {
      setLoading(false);
    }
  };

  // Server Countdown Timer
  useEffect(() => {
    if (loading || timeRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit('Automatic Timer Expiry');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, timeRemainingSeconds]);

  // Security Anti-Cheating Listeners (Tab switch, window blur, keyboard)
  useEffect(() => {
    if (!sessionId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSecurityViolation('tab_switch', 'Candidate navigated away from assessment window (Tab Switch Detected).');
      }
    };

    const handleWindowBlur = () => {
      triggerSecurityViolation('window_blur', 'Window focus lost. Please remain strictly on the examination window.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prohibit copy, paste, inspect, print screen
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 'u')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        triggerSecurityViolation('keyboard_shortcut', `Prohibited key combination (${e.key}) intercepted.`);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Tab close / window close immediate termination handler
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmittingOrDoneRef.current) return;
      if (sessionId) {
        api.terminateExamOnTabClose(sessionId, currentUser?.candidateId);
      }
      e.preventDefault();
      e.returnValue = 'Warning: Closing or reloading this tab will immediately terminate your assessment!';
      return e.returnValue;
    };

    const handleUnload = () => {
      if (isSubmittingOrDoneRef.current) return;
      if (sessionId) {
        api.terminateExamOnTabClose(sessionId, currentUser?.candidateId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [sessionId, violationsCount]);

  const triggerSecurityViolation = (eventType: string, details: string, immediateTerminate = false) => {
    if (!sessionId || isSubmittingOrDoneRef.current) return;

    // Handle Tab Switch / Window Blur with strict 2-warning -> 3rd-time termination rule
    if (eventType === 'tab_switch' || eventType === 'window_blur') {
      const now = Date.now();
      if (now - lastTabSwitchMsRef.current < 1200) return;
      lastTabSwitchMsRef.current = now;

      const nextTabCount = tabSwitchCountRef.current + 1;
      tabSwitchCountRef.current = nextTabCount;
      setTabSwitchCount(nextTabCount);

      const nextViolations = violationsCountRef.current + 1;
      violationsCountRef.current = nextViolations;
      setViolationsCount(nextViolations);

      api.logViolation({ sessionId, eventType, details, currentCount: nextViolations - 1 } as any).catch(() => {});

      if (nextTabCount >= 3 || nextViolations >= 15) {
        setViolationModal(null);
        handleAutoSubmit(
          nextTabCount >= 3
            ? 'Terminated: Tab Switch Limit Exceeded (3/3)'
            : 'Terminated: Maximum Proctoring Violations (15/15) Exceeded'
        );
        return;
      }

      const tabMsg =
        nextTabCount === 1
          ? `Tab Switch Warning (1 of 2): ${details} One more warning remains before automatic termination.`
          : `FINAL TAB SWITCH WARNING (2 of 2): ${details} Switching tabs or leaving this window ONE MORE TIME will IMMEDIATELY TERMINATE your assessment!`;

      setViolationModal({
        open: true,
        message: tabMsg,
        count: nextViolations,
      });
      return;
    }

    // Immediate termination for Mobile Phone Detection
    if (immediateTerminate) {
      const nextViolations = violationsCountRef.current + 1;
      violationsCountRef.current = nextViolations;
      setViolationsCount(nextViolations);
      api.logViolation({ sessionId, eventType, details, currentCount: nextViolations - 1 } as any).catch(() => {});
      setViolationModal(null);
      handleAutoSubmit(`Terminated: ${details}`);
      return;
    }

    // Standard Camera / Keyboard Violations -> Auto-terminate at 15
    const nextViolations = violationsCountRef.current + 1;
    violationsCountRef.current = nextViolations;
    setViolationsCount(nextViolations);
    api.logViolation({ sessionId, eventType, details, currentCount: nextViolations - 1 } as any).catch(() => {});

    if (nextViolations >= 15) {
      setViolationModal(null);
      handleAutoSubmit('Terminated: Maximum Proctoring Violations (15/15) Exceeded');
      return;
    }

    setViolationModal({
      open: true,
      message: `${details} (Violation ${nextViolations} of 15 — reaching 15 violations will automatically terminate your exam.)`,
      count: nextViolations,
    });
  };

  // Answer Selection & Heartbeat
  const handleSelectOption = async (optionId: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !sessionId) return;

    const updatedAnswers = { ...answers, [currentQ._id]: optionId };
    setAnswers(updatedAnswers);

    // Auto-save to backend
    api.saveAnswer({
      sessionId,
      questionId: currentQ._id,
      selectedOption: optionId,
    }).catch((err) => console.warn('Auto-save heartbeat failed:', err));
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !sessionId) return;

    const updated = { ...answers };
    delete updated[currentQ._id];
    setAnswers(updated);

    api.saveAnswer({
      sessionId,
      questionId: currentQ._id,
      selectedOption: '',
    });
  };

  const handleToggleMarkReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !sessionId) return;

    let updated: string[];
    const isMarked = markedForReview.includes(currentQ._id);
    if (isMarked) {
      updated = markedForReview.filter((id) => id !== currentQ._id);
    } else {
      updated = [...markedForReview, currentQ._id];
    }
    setMarkedForReview(updated);

    api.saveAnswer({
      sessionId,
      questionId: currentQ._id,
      isMarkedForReview: !isMarked,
    });
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      const targetQ = questions[index];
      setSelectedSection(targetQ.section);
      setVisited((prev) => ({ ...prev, [targetQ._id]: true }));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      navigateToQuestion(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigateToQuestion(currentIndex - 1);
    }
  };

  // Section Switcher
  const handleSelectSectionTab = (sec: 'section-1' | 'section-2' | 'section-3') => {
    setSelectedSection(sec);
    const firstIdx = questions.findIndex((q) => q.section === sec);
    if (firstIdx !== -1) {
      navigateToQuestion(firstIdx);
    }
  };

  const handleAutoSubmit = async (reason = 'Candidate Manual') => {
    if (submitting || isSubmittingOrDoneRef.current) return;
    isSubmittingOrDoneRef.current = true;
    setSubmitting(true);

    const activeSessionId = sessionId || localStorage.getItem('inzovate_session_id');
    const activeCandidateId = candidateMeta?.id || currentUser?.candidateId;

    const activeRoleTitle = candidateMeta?.jobRoleTitle || (currentUser as any)?.jobRoleTitle || 'Software Developer';
    const activeDomainName = candidateMeta?.domainName || (currentUser as any)?.domainName || 'Software Development';
    const activeRoleId = candidateMeta?.jobRoleId || (currentUser as any)?.jobRoleId || 'role-soft-dev';
    const activeDomainId = candidateMeta?.domainId || (currentUser as any)?.domainId || 'dom-01';

    try {
      const res = await api.submitExam({
        sessionId: activeSessionId || undefined,
        candidateId: activeCandidateId,
        candidateName: candidateMeta?.fullName || currentUser?.fullName,
        candidateEmail: candidateMeta?.email || currentUser?.email,
        jobRoleId: activeRoleId,
        jobRoleTitle: activeRoleTitle,
        domainId: activeDomainId,
        domainName: activeDomainName,
        submissionType: reason,
        answers: answers
      });

      if (res && res.success) {
        localStorage.removeItem('inzovate_session_id');
        localStorage.setItem('inzovate_exam_completed', 'true');
        setSubmitModalOpen(false);
        onExamComplete(res.result);
      } else {
        const errorMsg = res?.message || 'Assessment submission could not be completed.';
        // If server indicates already finalized or completed, gracefully complete
        if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('completed') || errorMsg.toLowerCase().includes('finalized')) {
          localStorage.removeItem('inzovate_session_id');
          localStorage.setItem('inzovate_exam_completed', 'true');
          setSubmitModalOpen(false);
          onExamComplete(res?.result || {
            candidateDisplayId: activeCandidateId,
            candidateName: candidateMeta?.fullName || currentUser?.fullName,
            jobRoleId: activeRoleId,
            jobRoleTitle: activeRoleTitle,
            domainId: activeDomainId,
            domainName: activeDomainName,
            status: 'Completed'
          });
        } else {
          isSubmittingOrDoneRef.current = false;
          alert(`Submission Notice: ${errorMsg}`);
        }
      }
    } catch (err: any) {
      isSubmittingOrDoneRef.current = false;
      alert(`Submission error: ${err.message || 'Network error during submission'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-700">Initializing Secure CBT Assessment Session...</p>
        <p className="text-xs text-slate-500">Retrieving 45 randomized questions & locking session snapshot...</p>
      </div>
    );
  }

  if (initError) {
    if (initError.isCompleted) {
      return (
        <div className="min-h-screen bg-[#0A1128] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-[#101F42] border border-slate-700 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Assessment Finalized
              </span>
              <h2 className="text-xl font-black text-white">Assessment Successfully Submitted</h2>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {initError.message}
              </p>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 text-left mt-3">
                <p><span className="text-slate-500">Candidate:</span> <strong className="text-white">{initError.candidate?.fullName || currentUser?.fullName || 'Registered Candidate'}</strong></p>
                <p><span className="text-slate-500">Candidate ID:</span> <strong className="text-sky-400 font-mono">{initError.candidate?.id || currentUser?.candidateId || 'INZ-CAND-2026-XXXXX'}</strong></p>
                <p><span className="text-slate-500">Applied Role:</span> <strong className="text-white">{initError.candidate?.jobRoleTitle || (currentUser as any)?.jobRoleTitle || 'Software Developer'}</strong></p>
              </div>
              <p className="text-[11px] text-slate-400 pt-2">
                Your responses and proctoring telemetry have been safely recorded in the Inzovate Assessment Engine. Re-attempting is strictly restricted.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => onExamComplete({})}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Submission Confirmation</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500">
              <span>Drive Evaluation Testing Mode: </span>
              <button
                onClick={handleResetAttempt}
                className="text-sky-400 hover:underline font-bold"
              >
                Reset Attempt & Retake Test
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0A1128] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full bg-[#101F42] border border-slate-700 rounded-2xl p-8 space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Assessment Access Notice</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {initError.message}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem('inzovate_user');
                localStorage.removeItem('inzovate_token');
                try {
                  sessionStorage.removeItem('inzovate_active_tab');
                } catch (e) {}
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Candidate Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || null;

  // Question counts calculations
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const unansweredCount = totalCount - answeredCount;

  // Format Timer HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isTimeCritical = timeRemainingSeconds < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-[#0A1128] text-white flex flex-col select-none">
      {/* Top Dark Navy Header */}
      <header className="bg-[#101F42] border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-md border border-blue-400/40 shrink-0">
            <img src="/inzovate-logo.png" alt="Inzovate Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white tracking-tight">INZOVATE TALENT ASSESSMENT</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono font-semibold">
                CBT V2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {candidateMeta?.fullName || currentUser?.fullName || 'Candidate'} • ID: {candidateMeta?.id || currentUser?.candidateId || 'N/A'} • Role: {candidateMeta?.jobRoleTitle || (currentUser as any)?.jobRoleTitle || 'Software Developer'}
            </p>
          </div>
        </div>

        {/* Server Synchronized Countdown Timer Widget */}
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm shadow-inner transition-colors ${
              isTimeCritical
                ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-sky-400'
            }`}
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          <button
            onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen();
              else document.exitFullscreen();
            }}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs hidden sm:flex items-center space-x-1"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSubmitModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Examination Layout: 3 Columns (Left Navigator, Center Question, Right Monitor) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Section Tabs & Question Palette (3 cols) */}
        <aside className="lg:col-span-3 bg-[#0D1836] border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-65px)]">
          <div className="space-y-4">
            {/* Section Tabs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Examination Sections</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'section-1', label: 'Aptitude', count: 15 },
                  { id: 'section-2', label: 'Comm', count: 15 },
                  { id: 'section-3', label: 'Technical', count: 15 },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSectionTab(s.id as any)}
                    className={`py-2 px-1 rounded text-center text-xs font-semibold transition-all ${
                      selectedSection === s.id
                        ? 'bg-blue-600 text-white shadow ring-1 ring-blue-400'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[10px] opacity-75 font-normal">({s.count} Qs)</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Palette Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Question Navigator</span>
                <span className="text-[11px] text-sky-400">Total: 45 Questions</span>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-1">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q._id] !== undefined;
                  const isMarked = markedForReview.includes(q._id);
                  const isVisited = visited[q._id] || idx === currentIndex;
                  const isCurrent = idx === currentIndex;

                  // Palette Color Coding Rules:
                  // Green: Answered
                  // Orange: Marked for Review
                  // Red: Unanswered (Visited but not answered)
                  // Grey: Not Visited
                  let bgClass = 'bg-slate-800 text-slate-400 border-slate-700'; // Grey Not Visited
                  if (isMarked) {
                    bgClass = 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-600/30';
                  } else if (isAnswered) {
                    bgClass = 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30';
                  } else if (isVisited) {
                    bgClass = 'bg-rose-700 text-white border-rose-600';
                  }

                  return (
                    <button
                      key={q._id}
                      onClick={() => navigateToQuestion(idx)}
                      className={`h-9 rounded-lg font-bold text-xs border flex items-center justify-center transition-all ${bgClass} ${
                        isCurrent ? 'ring-2 ring-white scale-105' : 'hover:opacity-90'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Legend */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-rose-700 shrink-0"></span>
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-600 shrink-0"></span>
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 shrink-0"></span>
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center space-x-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Answers saved continuously.</span>
            </p>
          </div>
        </aside>

        {/* CENTER COLUMN: Question & Answer Interaction Area (6 cols) */}
        <main className="lg:col-span-6 bg-[#070D1F] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-65px)]">
          {currentQ ? (
            <div className="space-y-6">
              {/* Question Header & Category Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs font-mono">
                    Q {currentIndex + 1} of 45
                  </span>
                  <span className="text-xs text-sky-400 font-medium">{currentQ.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentQ.difficulty === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : currentQ.difficulty === 'Medium'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">+{currentQ.marks || 1} Mark</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-sans whitespace-pre-line">
                  {currentQ.question}
                </p>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ._id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-400 shadow-md'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-slate-300 text-sm font-semibold">No questions loaded for this assessment session.</p>
              <p className="text-slate-500 text-xs">Please click below to re-sync questions with the Inzovate assessment engine.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow"
              >
                Reload Assessment
              </button>
            </div>
          )}

          {/* Action Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-6">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleClearResponse}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Response</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMarkReview}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  currentQ && markedForReview.includes(currentQ._id)
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {currentQ && markedForReview.includes(currentQ._id) ? 'Marked for Review' : 'Mark for Review'}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                  currentIndex === 0
                    ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow flex items-center space-x-1 transition-colors"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Real Webcam Proctoring Monitor & Integrity Stats (3 cols) */}
        <aside className="lg:col-span-3 bg-[#0D1836] border-l border-slate-800 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-65px)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>AI Live Proctoring Stream</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                Active
              </span>
            </div>

            {/* Real Webcam Component with Live AI Proctoring */}
            <WebcamFeed
              className="w-full h-44 shadow-lg"
              proctoringEnabled={!loading && Boolean(sessionId)}
              onProctorViolation={triggerSecurityViolation}
            />
          </div>

          {/* Assessment Integrity Widgets */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Proctor Violations</span>
              <span className={`font-bold font-mono ${violationsCount >= 10 ? 'text-rose-400' : violationsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {violationsCount} / 15
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tab Switches</span>
              <span className={`font-bold font-mono ${tabSwitchCount >= 2 ? 'text-rose-400' : tabSwitchCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {tabSwitchCount} / 3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Network Latency</span>
              <span className="font-semibold text-sky-400 flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <span>24 ms (Stable)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security Warning Level</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  violationsCount === 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : violationsCount === 1
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400 animate-pulse'
                }`}
              >
                {violationsCount} / 3 Warnings
              </span>
            </div>
          </div>

          {/* Section Summary */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Assessment Matrix</h4>
            <div className="flex justify-between text-slate-400">
              <span>Section 1: Aptitude & Reasoning</span>
              <span className="text-white font-mono">15 Qs</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Section 2: Communication</span>
              <span className="text-white font-mono">15 Qs</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Section 3: Domain Technical</span>
              <span className="text-white font-mono">15 Qs</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sky-400">
              <span>Total Questions</span>
              <span>45 Questions</span>
            </div>
          </div>

          {/* Warning Notice Box */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Proctoring Notice</span>
            </p>
            <p className="leading-relaxed">
              Exiting full-screen or switching browser tabs increments your security warning count. Assessments with 3
              strikes are automatically flagged for review.
            </p>
          </div>
        </aside>
      </div>

      {/* Security Violation Modal Alert */}
      {violationModal && violationModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto border border-red-500/40">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-red-400 tracking-tight">Security Integrity Warning #{violationModal.count}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{violationModal.message}</p>
            <p className="text-[11px] text-slate-400">
              Every incident is logged with timestamp and reported directly to Inzovate HR proctors.
            </p>
            <button
              onClick={() => setViolationModal(null)}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/30"
            >
              I Understand & Will Remain on Assessment Screen
            </button>
          </div>
        </div>
      )}

      {/* Final Submit Confirmation Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Submit Online Assessment</h3>
                <p className="text-xs text-slate-400">Review your question attempt status before final submission</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 font-semibold">Answered</p>
                <p className="text-2xl font-black text-emerald-300 mt-1">{answeredCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs text-rose-400 font-semibold">Unanswered</p>
                <p className="text-2xl font-black text-rose-300 mt-1">{unansweredCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400 font-semibold">Marked for Review</p>
                <p className="text-2xl font-black text-amber-300 mt-1">{markedCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <p className="text-xs text-slate-400 font-semibold">Time Remaining</p>
                <p className="text-xl font-bold font-mono text-sky-400 mt-1">{formatTime(timeRemainingSeconds)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-center">
              Once submitted, your responses will be evaluated server-side and an official assessment score report with
              verification certificate will be generated.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="w-1/2 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={() => handleAutoSubmit('Candidate Manual')}
                disabled={submitting}
                className="w-1/2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Finalize</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
