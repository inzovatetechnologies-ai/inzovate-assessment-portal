import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Code2,
  RefreshCw,
  Send,
  HelpCircle,
} from 'lucide-react';

export const CodingSandboxPage: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java'>('javascript');
  const [code, setCode] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getCodingChallenges();
        if (res.success && res.challenges.length > 0) {
          setChallenges(res.challenges);
          setActiveChallenge(res.challenges[0]);
          setCode(res.challenges[0].starterCode.javascript || '');
        }
      } catch (err) {
        console.error('Failed to load challenges:', err);
      }
    }
    load();
  }, []);

  const handleSelectChallenge = (c: any) => {
    setActiveChallenge(c);
    setCode(c.starterCode[selectedLanguage] || '');
    setExecutionResult(null);
  };

  const handleSelectLanguage = (lang: 'javascript' | 'python' | 'java') => {
    setSelectedLanguage(lang);
    if (activeChallenge) {
      setCode(activeChallenge.starterCode[lang] || '');
    }
  };

  const handleRunOrSubmit = async (isSubmission = false) => {
    if (!activeChallenge) return;
    setExecuting(true);
    try {
      const res = await api.executeCode({
        challengeId: activeChallenge.id,
        code,
        language: selectedLanguage,
        isSubmission,
      });
      if (res.success) {
        setExecutionResult(res);
      }
    } catch (err: any) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Skill Assessment Sandbox</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A1128] tracking-tight">Isolated Code Execution Engine</h1>
          <p className="text-xs text-slate-500">
            Automated test case validation, time complexity checks, and sandbox isolation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {challenges.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChallenge?.id === c.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {activeChallenge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Problem Description & Test Cases (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeChallenge.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {activeChallenge.id}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-2">{activeChallenge.title}</h2>
              <p className="text-xs text-slate-600 mt-3 whitespace-pre-line leading-relaxed">
                {activeChallenge.description}
              </p>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Example Test Cases</h4>
              {activeChallenge.examples?.map((ex: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                  <p className="text-slate-700">
                    <strong className="text-blue-700">Input: </strong> {ex.input}
                  </p>
                  <p className="text-slate-700">
                    <strong className="text-emerald-700">Output: </strong> {ex.output}
                  </p>
                  {ex.explanation && (
                    <p className="text-[11px] text-slate-500 font-sans mt-1">
                      <strong>Note: </strong> {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Public Test Cases */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Automated Grading Criterion</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Submissions run against both visible test cases and hidden edge test cases verifying O(N) linear time
                complexity and memory constraints.
              </p>
            </div>
          </div>

          {/* Right Column: Code Editor & Execution Results (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Editor Toolbar */}
            <div className="bg-[#0A1128] text-white p-3 rounded-t-2xl border-t border-x border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold font-mono">Solution Workspace</span>
              </div>

              {/* Language Selector */}
              <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs font-mono">
                {(['javascript', 'python', 'java'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedLanguage === lang ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                className="w-full p-4 bg-[#070D1F] text-sky-200 font-mono text-xs leading-relaxed border-x border-b border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-b-2xl resize-none shadow-inner"
                spellCheck={false}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Sandbox Isolation: Active</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRunOrSubmit(false)}
                  disabled={executing}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{executing ? 'Executing...' : 'Run Public Tests'}</span>
                </button>
                <button
                  onClick={() => handleRunOrSubmit(true)}
                  disabled={executing}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Code (All Tests)</span>
                </button>
              </div>
            </div>

            {/* Execution Result Box */}
            {executionResult && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    {executionResult.status === 'Accepted' ? (
                      <span className="flex items-center space-x-1.5 text-emerald-600 font-black text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Accepted ({executionResult.passedCount} / {executionResult.totalTests} Passed)</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 text-rose-600 font-black text-sm">
                        <XCircle className="w-5 h-5" />
                        <span>Wrong Answer ({executionResult.passedCount} / {executionResult.totalTests} Passed)</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Runtime: {executionResult.executionTimeMs} ms</span>
                  </div>
                </div>

                {/* Test Cases Results */}
                <div className="space-y-2">
                  {executionResult.testResults?.map((t: any) => (
                    <div
                      key={t.testCaseIndex}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between font-mono ${
                        t.passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {t.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                        <span>
                          Test Case #{t.testCaseIndex} {t.isHidden ? '(Hidden)' : ''}:{' '}
                          <strong>{t.passed ? 'PASSED' : 'FAILED'}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{t.executionTimeMs} ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
