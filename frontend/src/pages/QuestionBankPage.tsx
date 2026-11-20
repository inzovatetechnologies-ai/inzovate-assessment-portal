import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Question, JobRole, Domain } from '../types';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
  Layers,
  HelpCircle,
  FileText,
  BrainCircuit,
} from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sectionFilter, setSectionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [search, setSearch] = useState('');

  // AI Generation Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    domain: 'Software Development',
    jobRole: 'Software Developer',
    topic: 'Binary Search Tree Balancing & AVL Rotation',
    difficulty: 'Medium',
    count: 3,
    format: 'MCQ',
  });

  // Manual Question Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState<any>({
    section: 'section-1',
    category: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Medium',
    question: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    correctOption: 'A',
    explanation: '',
    marks: 1,
    isApproved: true,
  });

  useEffect(() => {
    loadAllQuestions();
  }, [sectionFilter, roleFilter, difficultyFilter]);

  async function loadAllQuestions() {
    setLoading(true);
    try {
      const [qRes, rolesRes, domRes] = await Promise.all([
        api.getQuestions({
          section: sectionFilter,
          roleId: roleFilter,
          difficulty: difficultyFilter,
        }),
        api.getJobRoles(),
        api.getDomains(),
      ]);

      if (qRes.success) setQuestions(qRes.questions);
      if (rolesRes.success) setJobRoles(rolesRes.roles);
      if (domRes.success) setDomains(domRes.domains);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateAi = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    try {
      const res = await api.generateAiDraftQuestions(aiForm);
      if (res.success) {
        setAiModalOpen(false);
        loadAllQuestions();
        alert(`Success: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error generating draft: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await api.approveQuestion(id);
      if (res.success) {
        loadAllQuestions();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await api.deleteQuestion(id);
      if (res.success) {
        loadAllQuestions();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    search ? q.question.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum & Evaluation Repository</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A1128] tracking-tight">Question Bank & AI Question Studio</h1>
          <p className="text-xs text-slate-500">
            Maintain verified pools for Aptitude, Communication, and Domain-Specific Technical assessments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate AI Draft Questions</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by topic or question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
          >
            <option value="">All 3 Sections</option>
            <option value="section-1">Section 1: Aptitude & Reasoning</option>
            <option value="section-2">Section 2: Communication</option>
            <option value="section-3">Section 3: Domain Technical</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy (30% Target)</option>
            <option value="Medium">Medium (50% Target)</option>
            <option value="Hard">Hard (20% Target)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          <span>Total Questions in Pool: </span>
          <strong className="text-blue-600 font-mono text-sm">{filteredQuestions.length}</strong>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q._id}
            className={`p-5 rounded-2xl border transition-all ${
              q.isApproved
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-amber-50/50 border-amber-300 shadow-sm ring-1 ring-amber-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                  {q.section === 'section-1'
                    ? 'Section 1: Aptitude'
                    : q.section === 'section-2'
                    ? 'Section 2: Communication'
                    : 'Section 3: Technical'}
                </span>
                <span className="text-xs font-semibold text-slate-700">{q.category}</span>
                <span className="text-xs text-slate-400">• {q.topic}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    q.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-700'
                      : q.difficulty === 'Medium'
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {q.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!q.isApproved ? (
                  <button
                    onClick={() => handleApprove(q._id)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve AI Draft</span>
                  </button>
                ) : (
                  <span className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active in Exam Bank</span>
                  </span>
                )}
                <button
                  onClick={() => handleDelete(q._id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-800 leading-relaxed mb-4">{q.question}</p>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {q.options?.map((opt) => (
                <div
                  key={opt.id}
                  className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                    opt.id === q.correctOption
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      opt.id === q.correctOption ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                </div>
              ))}
            </div>

            {q.explanation && (
              <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-slate-500 text-[11px] leading-relaxed border border-slate-200">
                <strong className="text-slate-700">Explanation: </strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Draft Question Generator Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Assessment Question Studio</h3>
                <p className="text-xs text-slate-500">
                  Generate draft questions. Mandates Admin approval before entering the live question bank.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateAi} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Job Role *</label>
                <select
                  value={aiForm.jobRole}
                  onChange={(e) => setAiForm({ ...aiForm, jobRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {jobRoles.map((r) => (
                    <option key={r._id} value={r.title}>
                      {r.title} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Technical Concept / Assessment Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Docker Container Networking and Bridge vs Host Mode"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Difficulty</label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Easy">Easy (30% Ratio)</option>
                    <option value="Medium">Medium (50% Ratio)</option>
                    <option value="Hard">Hard (20% Ratio)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Number of Questions</label>
                  <select
                    value={aiForm.count}
                    onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={2}>2 Questions</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
                <strong>Governance Notice:</strong> AI questions are assigned status <span className="font-mono font-bold">Unapproved</span> upon creation. They will not appear in candidate tests until manually verified.
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiGenerating ? 'Drafting Questions...' : 'Generate Drafts'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
