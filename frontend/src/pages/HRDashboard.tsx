import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Candidate } from '../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  ShieldAlert,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';

export const HRDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');

  // Candidate Inspection Drawer
  const [activeCandidate, setActiveCandidate] = useState<any>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);

  // Interview Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [interviewData, setInterviewData] = useState({
    roundName: 'Technical Round 1',
    interviewerName: 'Dr. Vikram Malhotra (Chief Architect)',
    interviewerEmail: 'architect@inzovate.com',
    scheduledDate: '2026-11-28',
    scheduledTime: '11:00 AM',
    meetingLink: 'https://meet.inzovate-technologies.com/interview-7891',
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setLoading(true);
    try {
      const res = await api.getCandidates();
      if (res.success) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      console.error('Failed to load HR candidates:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleInspectCandidate = async (candidateId: string) => {
    setInspectionLoading(true);
    try {
      const res = await api.getCandidateById(candidateId);
      if (res.success) {
        setActiveCandidate(res);
      }
    } catch (err) {
      console.error('Failed to inspect candidate:', err);
    } finally {
      setInspectionLoading(false);
    }
  };

  const handleUpdateStage = async (id: string, newStage: string) => {
    try {
      const res = await api.updateCandidateStage(id, newStage);
      if (res.success) {
        loadCandidates();
        if (activeCandidate && activeCandidate.candidate._id === id) {
          setActiveCandidate({
            ...activeCandidate,
            candidate: { ...activeCandidate.candidate, recruitmentStage: newStage },
          });
        }
      }
    } catch (err: any) {
      alert(`Error updating stage: ${err.message}`);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewCandidate) return;

    try {
      const res = await api.scheduleInterview({
        candidateId: interviewCandidate.candidateId,
        candidateName: interviewCandidate.fullName,
        candidateEmail: interviewCandidate.email,
        jobRoleTitle: interviewCandidate.jobRoleTitle,
        ...interviewData,
      });

      if (res.success) {
        setInterviewModalOpen(false);
        loadCandidates();
        alert(`Interview scheduled successfully for ${interviewCandidate.fullName}. Notification sent.`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const stages = [
    'All',
    'Assessment Pending',
    'Assessment Completed',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Selected',
    'Rejected',
  ];

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.candidateId.toLowerCase().includes(search.toLowerCase()) ||
      c.collegeName.toLowerCase().includes(search.toLowerCase());

    const matchesRole = selectedRole ? c.jobRoleId === selectedRole : true;
    const matchesStage = selectedStage === 'All' ? true : c.recruitmentStage === selectedStage;

    return matchesSearch && matchesRole && matchesStage;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Talent Acquisition Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A1128] tracking-tight">HR Recruitment & Candidate Evaluation</h1>
          <p className="text-xs text-slate-500">
            Review 45-question test submissions, compare candidate scores, and manage interview schedules.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            <span>Shortlisted: {candidates.filter((c) => c.recruitmentStage === 'Shortlisted').length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
            <span>Interviews: {candidates.filter((c) => c.recruitmentStage === 'Interview Scheduled').length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, Candidate ID, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {stages.map((stg) => (
              <button
                key={stg}
                onClick={() => setSelectedStage(stg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStage === stg
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Candidate</th>
                <th className="py-3 px-4 font-bold">College & Major</th>
                <th className="py-3 px-4 font-bold">Applied Job Role</th>
                <th className="py-3 px-4 font-bold text-center">Score (45)</th>
                <th className="py-3 px-4 font-bold text-center">Rating</th>
                <th className="py-3 px-4 font-bold text-center">Pipeline Stage</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{c.fullName}</p>
                    <p className="font-mono text-[10px] text-blue-600">{c.candidateId}</p>
                    <p className="text-[10px] text-slate-400">{c.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{c.collegeName}</p>
                    <p className="text-[10px] text-slate-500">
                      {c.degree} • CGPA: <strong>{c.cgpa}</strong>
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{c.jobRoleTitle}</span>
                    <span className="block text-[10px] text-slate-400">{c.domainName}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.totalScore !== null && c.totalScore !== undefined ? (
                      <div>
                        <span className="font-mono font-black text-sm text-slate-900">
                          {c.totalScore} <span className="text-xs font-normal text-slate-400">/ 45</span>
                        </span>
                        <span className="block text-[10px] text-blue-600 font-bold">{c.percentage}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.performanceCategory ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.performanceCategory}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.recruitmentStage === 'Shortlisted'
                          ? 'bg-blue-100 text-blue-800'
                          : c.recruitmentStage === 'Interview Scheduled'
                          ? 'bg-purple-100 text-purple-800'
                          : c.recruitmentStage === 'Selected'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.recruitmentStage === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.recruitmentStage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleInspectCandidate(c._id)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                    >
                      Review
                    </button>
                    {c.recruitmentStage !== 'Shortlisted' && (
                      <button
                        onClick={() => handleUpdateStage(c._id, 'Shortlisted')}
                        className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold"
                      >
                        Shortlist
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setInterviewCandidate(c);
                        setInterviewModalOpen(true);
                      }}
                      className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold"
                    >
                      Schedule Interview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Inspection Modal / Drawer */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{activeCandidate.candidate.fullName}</h3>
                <p className="text-xs text-blue-600 font-mono font-bold">
                  {activeCandidate.candidate.candidateId} • {activeCandidate.candidate.jobRoleTitle}
                </p>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Assessment Score Details if Available */}
            {activeCandidate.assessmentResult ? (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                  <span>Proctored 45-Question Assessment Scorecard</span>
                  <span className="text-lg font-black text-blue-700">
                    {activeCandidate.assessmentResult.totalScore} / 45 ({activeCandidate.assessmentResult.percentage}%)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Aptitude</p>
                    <p className="font-bold text-blue-700">
                      {activeCandidate.assessmentResult.sectionScores.section1.score} / 15
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Communication</p>
                    <p className="font-bold text-sky-700">
                      {activeCandidate.assessmentResult.sectionScores.section2.score} / 15
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Technical</p>
                    <p className="font-bold text-indigo-700">
                      {activeCandidate.assessmentResult.sectionScores.section3.score} / 15
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1">
                  <span>Certificate ID: {activeCandidate.assessmentResult.certificateId}</span>
                  <span className="text-emerald-700 font-semibold">
                    Proctoring Flags: {activeCandidate.assessmentResult.violationsCount || 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Assessment has not yet been taken by this candidate.
              </div>
            )}

            {/* Academic & Personal Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold">College / University</span>
                <p className="font-bold text-slate-800">{activeCandidate.candidate.collegeName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Degree & Department</span>
                <p className="font-bold text-slate-800">{activeCandidate.candidate.degree}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">CGPA / Percentage</span>
                <p className="font-bold text-slate-800">{activeCandidate.candidate.cgpa}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Arrears / Backlogs</span>
                <p className="font-bold text-slate-800">{activeCandidate.candidate.arrearStatus}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Email & Phone</span>
                <p className="text-slate-800">{activeCandidate.candidate.email}</p>
                <p className="text-slate-800">{activeCandidate.candidate.mobileNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Resume Attachment</span>
                <p className="text-blue-600 font-bold flex items-center space-x-1 cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{activeCandidate.candidate.resumeFileName || 'Resume.pdf'}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Current Stage: <strong>{activeCandidate.candidate.recruitmentStage}</strong>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStage(activeCandidate.candidate._id, 'Rejected')}
                  className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs hover:bg-rose-100"
                >
                  Reject Candidate
                </button>
                <button
                  onClick={() => handleUpdateStage(activeCandidate.candidate._id, 'Shortlisted')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 shadow"
                >
                  Move to Shortlisted
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {interviewModalOpen && interviewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Schedule Assessment Interview</h3>
            <p className="text-xs text-slate-500">
              Candidate: <strong>{interviewCandidate.fullName}</strong> ({interviewCandidate.candidateId})
            </p>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Interview Round *</label>
                <select
                  value={interviewData.roundName}
                  onChange={(e) => setInterviewData({ ...interviewData, roundName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Technical Round 1 (Algorithms & OOP)">Technical Round 1 (Algorithms & OOP)</option>
                  <option value="Technical Round 2 (System Design & Code)">
                    Technical Round 2 (System Design & Code)
                  </option>
                  <option value="Managerial & Cultural Fitment">Managerial & Cultural Fitment</option>
                  <option value="Final HR & Offer Discussion">Final HR & Offer Discussion</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Interviewer *</label>
                <input
                  type="text"
                  required
                  value={interviewData.interviewerName}
                  onChange={(e) => setInterviewData({ ...interviewData, interviewerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewData.scheduledDate}
                    onChange={(e) => setInterviewData({ ...interviewData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={interviewData.scheduledTime}
                    onChange={(e) => setInterviewData({ ...interviewData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Secure Meeting URL</label>
                <input
                  type="url"
                  value={interviewData.meetingLink}
                  onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setInterviewModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-bold rounded-lg shadow">
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
