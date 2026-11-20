import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Candidate, College, RecruitmentDrive, JobRole, Domain } from '../types';
import {
  Users,
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  Eye,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  X,
  AlertTriangle,
  Phone,
  Mail,
  UserCheck,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  ChevronRight,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Printer,
  MapPin,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scores' | 'registered' | 'drives' | 'audit'>('scores');
  const [candidateProfileView, setCandidateProfileView] = useState<'active' | 'deleted'>('active');

  const [metrics, setMetrics] = useState<any>({
    totalRegistered: 0,
    completedAssessments: 0,
    shortlistedCount: 0,
    underReviewCount: 0,
    totalColleges: 0,
    totalDrives: 0,
    avgScore: '0',
    avgPercentage: '0',
  });
  const [collegeAnalytics, setCollegeAnalytics] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [collegesList, setCollegesList] = useState<any[]>([]);
  const [pinnedColleges, setPinnedColleges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('inzovate_pinned_colleges');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchCandidate, setSearchCandidate] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [collegeSearchInput, setCollegeSearchInput] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<'score_desc' | 'score_asc' | 'name_asc'>('score_desc');
  const [loading, setLoading] = useState(true);

  // Selected Candidate for Detailed Modal Inspection
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Modals for creating drives & roles
  const [createDriveModal, setCreateDriveModal] = useState(false);
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [newDriveData, setNewDriveData] = useState({
    driveId: `INZ-DRIVE-2026-0${Math.floor(4 + Math.random() * 5)}`,
    name: '',
    collegeName: '',
    recruitmentDate: '2026-12-15',
    registrationDeadline: '2026-12-12',
    maxCandidates: 300,
    instructions: 'Desktop with camera mandatory.',
  });
  const [newRoleData, setNewRoleData] = useState({
    title: '',
    code: '',
    domainId: 'dom-01',
    description: '',
    skills: 'Data Structures, Algorithms',
    passingThreshold: 60,
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [analyticsRes, candRes, logsRes, collegesRes] = await Promise.all([
        api.getAnalytics(),
        api.getCandidates(),
        api.getAuditLogs(),
        api.getColleges(),
      ]);

      if (analyticsRes.success) {
        setMetrics(analyticsRes.metrics);
        setCollegeAnalytics(analyticsRes.collegeAnalytics || []);
        setFunnel(analyticsRes.funnel || []);
      }
      if (candRes.success) {
        setCandidates(candRes.candidates || []);
      }
      if (logsRes.success) {
        setAuditLogs(logsRes.logs || []);
      }
      if (collegesRes.success && collegesRes.colleges) {
        setCollegesList(collegesRes.colleges);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDrive(newDriveData);
      if (res.success) {
        setCreateDriveModal(false);
        loadAllAdminData();
      }
    } catch (err: any) {
      alert(`Error creating drive: ${err.message}`);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createJobRole({
        ...newRoleData,
        skills: newRoleData.skills.split(',').map((s) => s.trim()),
      });
      if (res.success) {
        setCreateRoleModal(false);
        loadAllAdminData();
      }
    } catch (err: any) {
      alert(`Error creating job role: ${err.message}`);
    }
  };

  // Add a college chip to the top list (called on enter, click add, or selecting suggestion)
  const handleAddCollegeChip = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPinnedColleges((prev) => {
      const updated = prev.includes(trimmed) ? prev : [trimmed, ...prev];
      try {
        localStorage.setItem('inzovate_pinned_colleges', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setCollegeFilter(trimmed);
    setCollegeSearchInput(trimmed);
    setShowCollegeDropdown(false);
  };

  // Remove a college chip from the top list
  const handleRemoveCollegeChip = (name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPinnedColleges((prev) => {
      const updated = prev.filter((col) => col !== name);
      try {
        localStorage.setItem('inzovate_pinned_colleges', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (collegeFilter === name) {
      setCollegeFilter('');
      setCollegeSearchInput('');
    }
  };

  // Unique list of colleges from registered candidates
  const candidateColleges = Array.from(
    new Set(candidates.map((c) => (c.collegeName || '').trim()).filter(Boolean))
  );

  // Combined master display list for Chips Bar: Active filter + Pinned colleges + Candidate colleges
  const allCollegesList: string[] = Array.from(
    new Set([
      ...(collegeFilter ? [collegeFilter] : []),
      ...pinnedColleges,
      ...candidateColleges
    ])
  ).filter(Boolean);

  // Autocomplete Suggestions: matches candidate colleges + master Tamil Nadu database
  const allKnownColleges = Array.from(
    new Set([
      ...allCollegesList,
      ...collegesList.map((c: any) => c.name)
    ])
  );

  const collegeSuggestions = allKnownColleges.filter((colName) => {
    if (!collegeSearchInput.trim()) return true;
    const q = collegeSearchInput.toLowerCase();
    const colObj = collegesList.find((c: any) => c.name.toLowerCase() === colName.toLowerCase());
    const matchesDistrict = colObj?.district?.toLowerCase().includes(q);
    return colName.toLowerCase().includes(q) || Boolean(matchesDistrict);
  }).slice(0, 35);

  // Filtered lists
  const filteredCandidates = candidates.filter((c: any) => {
    const q = searchCandidate.toLowerCase();
    const matchesSearch =
      !q ||
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.candidateId && c.candidateId.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.mobileNumber && c.mobileNumber.toLowerCase().includes(q)) ||
      (c.jobRoleTitle && c.jobRoleTitle.toLowerCase().includes(q)) ||
      (c.collegeName && c.collegeName.toLowerCase().includes(q));

    const matchesStage = stageFilter ? c.recruitmentStage === stageFilter : true;

    // College matching: if collegeFilter is set, match; else if collegeSearchInput is typed and not showing dropdown, match
    let matchesCollege = true;
    if (collegeFilter) {
      matchesCollege =
        (c.collegeName || '').trim().toLowerCase() === collegeFilter.trim().toLowerCase() ||
        (c.collegeName || '').toLowerCase().includes(collegeFilter.toLowerCase());
    } else if (collegeSearchInput.trim() && !showCollegeDropdown) {
      matchesCollege = (c.collegeName || '').toLowerCase().includes(collegeSearchInput.trim().toLowerCase());
    }

    // District matching
    let matchesDistrict = true;
    if (districtFilter) {
      const colObj = collegesList.find(
        (col) => col.name.toLowerCase() === (c.collegeName || '').toLowerCase()
      );
      const colDistrict = colObj?.district?.toLowerCase() || '';
      matchesDistrict =
        colDistrict.includes(districtFilter.toLowerCase()) ||
        (c.collegeName || '').toLowerCase().includes(districtFilter.toLowerCase()) ||
        (c.district || '').toLowerCase().includes(districtFilter.toLowerCase());
    }

    return matchesSearch && matchesStage && matchesCollege && matchesDistrict;
  });

  const activeCandidates = filteredCandidates.filter((c: any) => c.status !== 'deleted');
  const deletedCandidates = filteredCandidates.filter((c: any) => c.status === 'deleted');
  const displayedCandidates = candidateProfileView === 'active' ? activeCandidates : deletedCandidates;

  // Candidates who attended / attempted the assessment (excluding deleted profiles)
  const attendedCandidates = filteredCandidates.filter((c: any) => {
    if (c.status === 'deleted') return false;
    return (
      (c.totalScore !== null && c.totalScore !== undefined) ||
      c.assessmentResult ||
      c.assessmentStatus === 'Completed' ||
      c.assessmentStatus === 'In Progress' ||
      c.assessmentStatus === 'Terminated' ||
      c.recruitmentStage !== 'Assessment Pending'
    );
  });

  // Sorted Attended Candidates based on Top to Low / Low to Top Marks
  const sortedAttendedCandidates = [...attendedCandidates].sort((a: any, b: any) => {
    const scoreA = Number(a.assessmentResult?.totalScore ?? a.totalScore ?? -1);
    const scoreB = Number(b.assessmentResult?.totalScore ?? b.totalScore ?? -1);

    if (sortOrder === 'score_desc') {
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.fullName || '').localeCompare(b.fullName || '');
    } else if (sortOrder === 'score_asc') {
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (a.fullName || '').localeCompare(b.fullName || '');
    } else {
      return (a.fullName || '').localeCompare(b.fullName || '');
    }
  });

  // Export Mark List as Excel (.CSV)
  const exportToExcel = () => {
    if (sortedAttendedCandidates.length === 0) {
      alert('No candidate records available to export.');
      return;
    }

    const headers = [
      'Rank',
      'Candidate ID',
      'Full Name',
      'Email',
      'Mobile Number',
      'College / University',
      'Degree',
      'Department',
      'Job Role',
      'Questions Attempted (/45)',
      'Questions Unattempted (/45)',
      'Aptitude (/15)',
      'Communication (/15)',
      'Technical (/15)',
      'Total Score (/45)',
      'Percentage (%)',
      'Exam Status',
      'Cutoff Qualified (>=60%)',
      'Recruitment Stage',
    ];

    const rows = sortedAttendedCandidates.map((c: any, idx: number) => {
      const r = c.assessmentResult;
      const total = r?.totalScore !== undefined ? r.totalScore : c.totalScore ?? 0;
      const pct = r?.percentage !== undefined ? r.percentage : c.percentage ?? 0;
      const sec1 = r?.sectionScores?.['section-1']?.score ?? 0;
      const sec2 = r?.sectionScores?.['section-2']?.score ?? 0;
      const sec3 = r?.sectionScores?.['section-3']?.score ?? 0;
      const isPassed = total >= 27;
      const attempted = r?.totalAttempted ?? 0;
      const unattempted = r?.unattempted ?? Math.max(0, 45 - attempted);

      return [
        idx + 1,
        `"${c.candidateId}"`,
        `"${c.fullName || ''}"`,
        `"${c.email || ''}"`,
        `"${c.mobileNumber || ''}"`,
        `"${c.collegeName || ''}"`,
        `"${c.degree || ''}"`,
        `"${c.department || ''}"`,
        `"${c.jobRoleTitle || ''}"`,
        attempted,
        unattempted,
        sec1,
        sec2,
        sec3,
        total,
        `"${pct}%"`,
        `"${c.assessmentStatus || 'Completed'}"`,
        isPassed ? 'YES (Shortlisted)' : 'NO (Under Review)',
        `"${c.recruitmentStage || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const collegeTag = collegeFilter ? collegeFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'All_Colleges';
    link.setAttribute(
      'download',
      `Inzovate_Assessment_MarkList_${collegeTag}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Mark List as Printable PDF Report
  const exportToPDF = () => {
    if (sortedAttendedCandidates.length === 0) {
      alert('No candidate records available to print or export.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the printable PDF report.');
      return;
    }

    const targetCollege = collegeFilter || 'All Affiliated Colleges & Institutions';
    const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const passedCount = sortedAttendedCandidates.filter((c: any) => {
      const tot = c.assessmentResult?.totalScore ?? c.totalScore ?? 0;
      return tot >= 27;
    }).length;

    const rowsHtml = sortedAttendedCandidates
      .map((c: any, idx: number) => {
        const r = c.assessmentResult;
        const total = r?.totalScore !== undefined ? r.totalScore : c.totalScore ?? 0;
        const pct = r?.percentage !== undefined ? r.percentage : c.percentage ?? 0;
        const sec1 = r?.sectionScores?.['section-1']?.score ?? '-';
        const sec2 = r?.sectionScores?.['section-2']?.score ?? '-';
        const sec3 = r?.sectionScores?.['section-3']?.score ?? '-';
        const isPassed = total >= 27;

        return `
          <tr style="border-bottom: 1px solid #E2E8F0; ${idx % 2 === 1 ? 'background-color: #F8FAFC;' : ''}">
            <td style="padding: 10px; font-weight: bold; text-align: center; color: #1E293B;">#${idx + 1}</td>
            <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #0284C7;">${c.candidateId}</td>
            <td style="padding: 10px;">
              <div style="font-weight: bold; color: #0F172A;">${c.fullName}</div>
              <div style="font-size: 11px; color: #64748B;">${c.email}</div>
            </td>
            <td style="padding: 10px; font-size: 11px; color: #334155;">${c.collegeName}</td>
            <td style="padding: 10px; font-size: 11px; color: #334155;">${c.jobRoleTitle}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace; font-weight: bold; color: #0284C7;">${r?.totalAttempted ?? (c.assessmentResult?.totalAttempted ?? 0)}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${sec1}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${sec2}</td>
            <td style="padding: 10px; text-align: center; font-family: monospace;">${sec3}</td>
            <td style="padding: 10px; text-align: center; font-weight: 800; font-size: 14px; color: ${
              isPassed ? '#16A34A' : '#1E293B'
            }; background: #EFF6FF;">
              ${total} / 45
            </td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: #0284C7;">${pct}%</td>
            <td style="padding: 10px; text-align: center;">
              <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; ${
                isPassed
                  ? 'background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0;'
                  : 'background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;'
              }">
                ${isPassed ? 'SHORTLISTED' : 'UNDER REVIEW'}
              </span>
            </td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inzovate Technologies - Assessment Mark List (${targetCollege})</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 20px; font-size: 12px; }
          .header { border-bottom: 2px solid #0A1128; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 900; color: #0A1128; letter-spacing: 0.5px; }
          .subtitle { font-size: 12px; color: #0284C7; font-weight: 700; text-transform: uppercase; margin-top: 3px; }
          .meta-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 11px; }
          .meta-item strong { display: block; color: #64748B; font-size: 10px; text-transform: uppercase; }
          .meta-item span { font-weight: bold; color: #0F172A; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #0A1128; color: #ffffff; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .footer { margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #64748B; }
          .print-btn { background: #0066FF; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 16px; font-size: 12px; }
          @media print { .no-print { display: none !important; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 10px;">
          <button class="print-btn" onclick="window.print()">🖨️ Click Here to Print / Save as PDF</button>
        </div>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="/inzovate-logo.png" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px;" />
            <div>
              <div class="title">INZOVATE TECHNOLOGIES PRIVATE LIMITED</div>
              <div class="subtitle">Official Talent Assessment & Examination Mark List • CIN: U62011TZ2025PTC036329</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Drive Report Date: <strong>${dateStr}</strong></div>
            <div>Evaluation Engine: <strong>CBT V2.0 Enterprise</strong></div>
            <div>Ministry of Corporate Affairs Registered</div>
          </div>
        </div>

        <div class="meta-box">
          <div class="meta-item">
            <strong>Target College / Institution</strong>
            <span>${targetCollege}</span>
          </div>
          <div class="meta-item">
            <strong>Candidates Evaluated</strong>
            <span>${sortedAttendedCandidates.length} Students</span>
          </div>
          <div class="meta-item">
            <strong>Cutoff Passed (&ge;60%)</strong>
            <span style="color: #16A34A;">${passedCount} Shortlisted (${Math.round(
      (passedCount / (sortedAttendedCandidates.length || 1)) * 100
    )}%)</span>
          </div>
          <div class="meta-item">
            <strong>Ranking Criterion</strong>
            <span>${
              sortOrder === 'score_desc' ? 'Highest Score First (Top to Low)' : 'Lowest Score First (Low to Top)'
            }</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 45px;">Rank</th>
              <th style="width: 120px;">Candidate ID</th>
              <th>Candidate Name & Email</th>
              <th>College</th>
              <th>Applied Role</th>
              <th style="text-align: center;">Att (/45)</th>
              <th style="text-align: center;">Apt (/15)</th>
              <th style="text-align: center;">Comm (/15)</th>
              <th style="text-align: center;">Tech (/15)</th>
              <th style="text-align: center;">Total (/45)</th>
              <th style="text-align: center;">%</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>© 2026 INZOVATE TECHNOLOGIES PRIVATE LIMITED • All Assessment Telemetry Cryptographically Logged</div>
          <div>Page 1 of 1 • Official Controller of Examination Dossier</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-200 shadow-md flex items-center justify-center shrink-0">
            <img src="/inzovate-logo.png" alt="Inzovate Technologies" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase mb-1.5 border border-blue-100">
              <Building className="w-3.5 h-3.5" />
              <span>Inzovate Administration • CIN: U62011TZ2025PTC036329</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1128] tracking-tight">
              Recruitment Command & Assessment Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Restricted Admin Console • Campus drives, candidate scores, proctoring telemetry & dossier management.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadAllAdminData()}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            title="Refresh All Records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setCreateDriveModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Drive</span>
          </button>
          <button
            onClick={() => setCreateRoleModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow transition-all"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{metrics.totalRegistered}</p>
          <p className="text-[11px] text-slate-400 mt-1">Registered candidate profiles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Tests Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{metrics.completedAssessments}</p>
          <p className="text-[11px] text-slate-400 mt-1">Evaluated 45-Q assessments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Shortlisted</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-blue-600 mt-2">{metrics.shortlistedCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Achieved &ge; 60% Cutoff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Avg Assessment Score</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600 mt-2">
            {metrics.avgScore} <span className="text-sm font-normal text-slate-400">/ 45 ({metrics.avgPercentage}%)</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Aggregate cohort average</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('scores')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scores'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Candidate Exam Scores & Results ({attendedCandidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'registered'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Registered Profiles ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'drives'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Campus Drives & Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-500'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security Ledger & Proctoring Flags</span>
        </button>
      </div>

      {/* Global Filter, Search & College Autocomplete Bar */}
      {(activeTab === 'scores' || activeTab === 'registered') && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Candidate Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by candidate name, ID, email, mobile, role..."
                value={searchCandidate}
                onChange={(e) => setSearchCandidate(e.target.value)}
                className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Typeahead College Name Search Input & Dropdown */}
            <div className="relative flex-1 min-w-[280px]">
              <div className="flex items-center space-x-1.5">
                <div className="relative flex-1">
                  <GraduationCap className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Type or click college name (e.g. Kongu, PSNA, CIT, MCET)..."
                    value={collegeSearchInput}
                    onChange={(e) => {
                      setCollegeSearchInput(e.target.value);
                      setShowCollegeDropdown(true);
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && collegeSearchInput.trim()) {
                        e.preventDefault();
                        handleAddCollegeChip(collegeSearchInput.trim());
                      }
                    }}
                    className="pl-9 pr-8 py-2 w-full rounded-xl border border-blue-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50/20 font-medium text-slate-800"
                  />
                  {collegeSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCollegeSearchInput('');
                        setCollegeFilter('');
                        setShowCollegeDropdown(false);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Add Filter Button */}
                {collegeSearchInput.trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddCollegeChip(collegeSearchInput.trim())}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showCollegeDropdown && (
                <div className="absolute top-11 left-0 right-0 z-30 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {/* Option to add custom typed text as filter chip */}
                  {collegeSearchInput.trim() && !allKnownColleges.some((c) => c.toLowerCase() === collegeSearchInput.trim().toLowerCase()) && (
                    <div
                      onClick={() => handleAddCollegeChip(collegeSearchInput.trim())}
                      className="p-2.5 bg-blue-50/90 hover:bg-blue-100 cursor-pointer font-bold text-blue-700 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Add "{collegeSearchInput.trim()}" as College Filter Chip</span>
                      </div>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        Custom
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() => {
                      setCollegeFilter('');
                      setCollegeSearchInput('');
                      setDistrictFilter('');
                      setShowCollegeDropdown(false);
                    }}
                    className="p-2.5 hover:bg-slate-50 cursor-pointer font-bold text-blue-600 flex items-center justify-between"
                  >
                    <span>All Colleges & Universities</span>
                    <span className="text-[10px] text-slate-400 font-mono">({candidates.length} candidates)</span>
                  </div>

                  {collegeSuggestions.map((col) => {
                    const count = candidates.filter((c) => (c.collegeName || '').trim().toLowerCase() === col.trim().toLowerCase()).length;
                    const isSelected = collegeFilter.trim().toLowerCase() === col.trim().toLowerCase();
                    const colObj = collegesList.find((c: any) => c.name.toLowerCase() === col.toLowerCase());
                    const district = colObj?.district || '';

                    return (
                      <div
                        key={col}
                        onClick={() => handleAddCollegeChip(col)}
                        className={`p-2.5 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-2">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{col}</span>
                          {district && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 font-medium shrink-0 border border-indigo-100">
                              {district}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold shrink-0">
                          {count} students
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stage Selector */}
            <div className="flex items-center gap-2">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
              >
                <option value="">All Recruitment Stages</option>
                <option value="Assessment Pending">Assessment Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Quick District Filter Pills */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1 text-[11px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-slate-400" />
              Districts:
            </span>
            {[
              { id: '', label: 'All Districts' },
              { id: 'Coimbatore', label: 'Coimbatore' },
              { id: 'Dindigul', label: 'Dindigul' },
              { id: 'Erode', label: 'Erode' },
              { id: 'Pollachi', label: 'Pollachi' },
              { id: 'Tiruppur', label: 'Tiruppur' },
              { id: 'Chennai', label: 'Chennai' },
              { id: 'Madurai', label: 'Madurai' },
              { id: 'Tiruchirappalli', label: 'Trichy' },
              { id: 'Salem', label: 'Salem' },
              { id: 'Namakkal', label: 'Namakkal' },
              { id: 'Tirunelveli', label: 'Tirunelveli' },
            ].map((d) => (
              <button
                key={d.id || 'all-dist'}
                onClick={() => setDistrictFilter(districtFilter === d.id ? '' : d.id)}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  districtFilter === d.id
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Dynamic Filter College Chips (Displays active filter, pinned colleges and all candidate colleges) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Colleges ({allCollegesList.length}):
            </span>
            <button
              onClick={() => {
                setCollegeFilter('');
                setCollegeSearchInput('');
                setDistrictFilter('');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !collegeFilter && !districtFilter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Colleges ({candidates.length})
            </button>
            {allCollegesList.map((col) => {
              const count = candidates.filter((c) => (c.collegeName || '').trim().toLowerCase() === col.trim().toLowerCase()).length;
              const isSelected = collegeFilter.trim().toLowerCase() === col.trim().toLowerCase();
              const isPinned = pinnedColleges.includes(col);
              return (
                <div
                  key={col}
                  className={`inline-flex items-center rounded-lg text-xs font-semibold transition-all shadow-sm ${
                    isSelected
                      ? 'bg-blue-600 text-white ring-1 ring-blue-500 shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setCollegeFilter('');
                        setCollegeSearchInput('');
                      } else {
                        setCollegeFilter(col);
                        setCollegeSearchInput(col);
                      }
                    }}
                    className="px-3 py-1 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>{col}</span>
                    <span
                      className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                  {isPinned && (
                    <button
                      type="button"
                      title={`Remove ${col} chip`}
                      onClick={(e) => handleRemoveCollegeChip(col, e)}
                      className={`pr-2 pl-0.5 py-1 text-xs hover:opacity-100 transition-opacity ${
                        isSelected ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active College Notice if filtered */}
          {collegeFilter && (
            <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>
                  Filtering Results for: <strong>{collegeFilter}</strong> ({sortedAttendedCandidates.length} attended assessment)
                </span>
              </div>
              <button
                onClick={() => {
                  setCollegeFilter('');
                  setCollegeSearchInput('');
                }}
                className="text-blue-700 hover:text-blue-900 font-bold text-xs hover:underline flex items-center space-x-1"
              >
                <span>Clear Filter</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: ATTENDED CANDIDATES & DETAILED SCORES             */}
      {/* ======================================================== */}
      {activeTab === 'scores' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#0A1128]">
                  Assessment Examination Scores & Merit Rankings
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold">
                  {sortedAttendedCandidates.length} Candidates Evaluated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact candidate marks (Aptitude /15, Communication /15, Technical /15, Total /45). Pass cutoff: &ge; 27 / 45 (60%).
              </p>
            </div>

            {/* Sort Controls & Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sort Order Selector */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
                >
                  <option value="score_desc">Top Mark to Low Mark (Rank 1 First ↓)</option>
                  <option value="score_asc">Low Mark to Top Mark (Ascending ↑)</option>
                  <option value="name_asc">Candidate Name (A-Z)</option>
                </select>
              </div>

              {/* Download Excel Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                title="Download Candidate Mark List as Excel (.CSV)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0A1128] hover:bg-[#101F42] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                title="Download Candidate Mark List as Printable PDF"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 font-bold text-center w-14">Rank</th>
                  <th className="py-3 px-4 font-bold">Candidate</th>
                  <th className="py-3 px-4 font-bold">Role & College</th>
                  <th className="py-3 px-3 font-bold text-center">Aptitude (15)</th>
                  <th className="py-3 px-3 font-bold text-center">Comm (15)</th>
                  <th className="py-3 px-3 font-bold text-center">Tech (15)</th>
                  <th
                    onClick={() => setSortOrder((prev) => (prev === 'score_desc' ? 'score_asc' : 'score_desc'))}
                    className="py-3 px-4 font-bold text-center bg-blue-50/70 text-blue-900 cursor-pointer hover:bg-blue-100 transition-colors select-none"
                    title="Click to toggle Top Mark to Low Mark / Low Mark to Top Mark"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Total Score (45)</span>
                      {sortOrder === 'score_desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-blue-700" />
                      ) : sortOrder === 'score_asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-blue-700" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold text-center">Status</th>
                  <th className="py-3 px-3 font-bold text-center">Result</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAttendedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No candidate assessments found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  sortedAttendedCandidates.map((c: any, idx: number) => {
                    const r = c.assessmentResult;
                    const total = r?.totalScore !== undefined ? r.totalScore : c.totalScore;
                    const pct = r?.percentage !== undefined ? r.percentage : c.percentage;
                    const sec1 = r?.sectionScores?.['section-1']?.score ?? '-';
                    const sec2 = r?.sectionScores?.['section-2']?.score ?? '-';
                    const sec3 = r?.sectionScores?.['section-3']?.score ?? '-';
                    const isTerminated = c.assessmentStatus === 'Terminated' || r?.status === 'Terminated';
                    const isPassed = total !== null && total !== undefined && total >= 27;

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Rank Column */}
                        <td className="py-3.5 px-3 text-center">
                          {idx === 0 ? (
                            <span
                              className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs inline-flex items-center justify-center shadow-sm"
                              title="Rank 1 - Top Scorer"
                            >
                              1
                            </span>
                          ) : idx === 1 ? (
                            <span
                              className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs inline-flex items-center justify-center shadow-sm"
                              title="Rank 2"
                            >
                              2
                            </span>
                          ) : idx === 2 ? (
                            <span
                              className="w-7 h-7 rounded-full bg-amber-700/80 text-white font-black text-xs inline-flex items-center justify-center shadow-sm"
                              title="Rank 3"
                            >
                              3
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-slate-500 text-xs">#{idx + 1}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{c.fullName}</p>
                          <p className="font-mono text-[11px] text-blue-600 font-semibold">{c.candidateId}</p>
                          <p className="text-[10px] text-slate-400">{c.email}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{c.jobRoleTitle}</span>
                          <span className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            <span>{c.collegeName}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-700">
                          {sec1} <span className="text-[10px] text-slate-400">/ 15</span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-700">
                          {sec2} <span className="text-[10px] text-slate-400">/ 15</span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-700">
                          {sec3} <span className="text-[10px] text-slate-400">/ 15</span>
                        </td>

                        <td className="py-3.5 px-4 text-center bg-blue-50/30">
                          {total !== null && total !== undefined ? (
                            <div>
                              <span
                                className={`text-base font-black font-mono ${
                                  isPassed ? 'text-emerald-600' : 'text-slate-800'
                                }`}
                              >
                                {total}
                              </span>
                              <span className="text-xs text-slate-400 font-normal"> / 45</span>
                              <div className="text-[10px] font-semibold text-blue-700 font-mono">({pct}%)</div>
                              <div className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                Attempted: {r?.totalAttempted ?? (c.assessmentResult?.totalAttempted ?? (total ? total : 0))} / 45
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">In Progress</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {isTerminated ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Terminated</span>
                            </span>
                          ) : total !== null && total !== undefined ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                              Active / Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {c.performanceCategory || r?.performanceCategory ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {c.performanceCategory || r?.performanceCategory}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedCandidate(c)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center space-x-1"
                              title="View Full Candidate Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Dossier</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Reset assessment attempt for ${c.fullName} (${c.candidateId})? This will allow them to retake the 45-question CBT test.`)) {
                                  try {
                                    const res = await api.resetExamAttempt(c.candidateId);
                                    if (res.success) {
                                      alert(res.message);
                                      loadAllAdminData();
                                    } else {
                                      alert(res.message || 'Error resetting attempt');
                                    }
                                  } catch (e: any) {
                                    alert(e.message || 'Reset failed');
                                  }
                                }
                              }}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[11px] font-semibold transition-all"
                              title="Reset assessment attempt to allow re-take"
                            >
                              Reset Attempt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ALL REGISTERED PROFILES (FULL DOSSIER TABLE)      */}
      {/* ======================================================== */}
      {activeTab === 'registered' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0A1128] flex items-center space-x-2">
                <span>Registered Candidate Profiles</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                  {candidateProfileView === 'active' ? activeCandidates.length : deletedCandidates.length} Displayed
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full applicant registration data: personal contact, parent details, academic CGPA, backlogs & applied role.
              </p>
            </div>

            {/* Active Profiles vs Deleted Archive Toggle */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCandidateProfileView('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  candidateProfileView === 'active'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Active Profiles ({activeCandidates.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCandidateProfileView('deleted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  candidateProfileView === 'deleted'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Deleted Archive ({deletedCandidates.length})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Candidate Details</th>
                  <th className="py-3 px-4 font-bold">Contact / Parent</th>
                  <th className="py-3 px-4 font-bold">Academic Qualification</th>
                  <th className="py-3 px-3 font-bold text-center">CGPA / Backlogs</th>
                  <th className="py-3 px-4 font-bold">Applied Job Role</th>
                  <th className="py-3 px-3 font-bold text-center">Stage</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      {candidateProfileView === 'active'
                        ? 'No active candidate profiles found.'
                        : 'No deleted candidate profiles in archive.'}
                    </td>
                  </tr>
                ) : (
                  displayedCandidates.map((c: any) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{c.fullName}</p>
                        <div className="flex items-center space-x-1.5">
                          <p className="font-mono text-[11px] text-blue-600 font-semibold">{c.candidateId}</p>
                          {c.status === 'deleted' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                              Deleted
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {c.status === 'deleted' && c.deletedAt
                            ? `Deleted: ${new Date(c.deletedAt).toLocaleDateString()}`
                            : `Reg: ${new Date(c.createdAt || Date.now()).toLocaleDateString()}`}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center space-x-1 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.mobileNumber}</span>
                        </div>
                        {c.fatherName && (
                          <p className="text-[10px] text-slate-400">Parent: {c.fatherName} ({c.fatherMobile || c.emergencyContact || 'N/A'})</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{c.collegeName}</p>
                        <p className="text-[11px] text-slate-500">
                          {c.degree || 'B.E.'} - {c.department || 'CSE'} ({c.graduationYear || '2026'})
                        </p>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <p className="font-bold text-slate-900 font-mono">{c.cgpa || '8.2'} CGPA</p>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            Number(c.backlogCount) > 0
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.arrearStatus || '0 Backlogs'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{c.jobRoleTitle}</span>
                        <span className="text-[10px] text-sky-600 font-medium">{c.domainName}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {c.status === 'deleted' ? (
                          <span className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-[11px]">
                            Archived
                          </span>
                        ) : (
                          <select
                            value={c.recruitmentStage}
                            onChange={(e) => {
                              api.updateCandidateStage(c._id, e.target.value).then(() => loadAllAdminData());
                            }}
                            className="px-2 py-1 rounded-lg border border-slate-300 text-[11px] bg-white font-medium focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Assessment Pending">Assessment Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center space-x-1 shadow-sm"
                            title="Inspect Profile Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {c.status !== 'deleted' ? (
                            <button
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `Delete profile for ${c.fullName} (${c.candidateId})?\n\nThis will move the candidate to Deleted Archive. Their email and mobile number will be released so they can register brand new if needed.`
                                  )
                                ) {
                                  try {
                                    const res = await api.deleteCandidate(c.candidateId, 'delete');
                                    if (res && res.success) {
                                      await loadAllAdminData();
                                    } else {
                                      alert(res?.message || 'Failed to delete candidate.');
                                    }
                                  } catch (e: any) {
                                    alert(e.message || 'Error deleting candidate');
                                  }
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                              title="Delete profile and release email/mobile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Restore candidate ${c.fullName} (${c.candidateId}) back to Active Profiles?`
                                    )
                                  ) {
                                    try {
                                      const res = await api.deleteCandidate(c.candidateId, 'restore');
                                      if (res && res.success) {
                                        await loadAllAdminData();
                                      } else {
                                        alert(res?.message || 'Failed to restore candidate.');
                                      }
                                    } catch (e: any) {
                                      alert(e.message || 'Error restoring candidate');
                                    }
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                                title="Restore profile to Active"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `PERMANENTLY DELETE ${c.fullName} (${c.candidateId})?\n\nThis will permanently delete this candidate from the database. This action cannot be undone.`
                                    )
                                  ) {
                                    try {
                                      const res = await api.deleteCandidate(c.candidateId, 'permanent_delete');
                                      if (res && res.success) {
                                        await loadAllAdminData();
                                      } else {
                                        alert(res?.message || 'Failed to permanently delete candidate.');
                                      }
                                    } catch (e: any) {
                                      alert(e.message || 'Error deleting candidate');
                                    }
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                                title="Permanently delete from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Purge</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CAMPUS RECRUITMENT DRIVES & PIPELINE FUNNEL       */}
      {/* ======================================================== */}
      {activeTab === 'drives' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0A1128]">Campus Drive Performance Index</h3>
                <p className="text-xs text-slate-500">Real-time candidate metrics categorized by college</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Active Drives
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">College / University</th>
                    <th className="py-2.5 font-bold text-center">Registered</th>
                    <th className="py-2.5 font-bold text-center">Completed</th>
                    <th className="py-2.5 font-bold text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {collegeAnalytics.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-3 text-center font-mono font-medium text-slate-600">{c.registered}</td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-600">{c.completed}</td>
                      <td className="py-3 text-right font-mono font-black text-blue-600">
                        {c.avgScore} <span className="text-[10px] text-slate-400 font-normal">/ 45</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#0A1128]">Recruitment Pipeline Funnel</h3>
              <p className="text-xs text-slate-500">End-to-end candidate conversion pipeline</p>
            </div>

            <div className="space-y-3 pt-2">
              {funnel.map((step, idx) => {
                const maxVal = metrics.totalRegistered || 1;
                const widthPct = Math.max(15, Math.round((step.count / maxVal) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{step.stage}</span>
                      <span className="font-mono text-blue-600 font-bold">{step.count} candidates</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-sky-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AUDIT LEDGER & PROCTORING TELEMETRY               */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-[#0A1128]">System Audit Trail & Compliance Ledger</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Tamper-Proof Session Logs</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      [{log.actorRole} • {log.actorEmail}]
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CANDIDATE FULL DOSSIER & SCORECARD MODAL                 */}
      {/* ======================================================== */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Candidate Comprehensive Dossier
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedCandidate.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedCandidate.candidateId}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase">Assessment Score (Admin Only)</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {selectedCandidate.totalScore !== null && selectedCandidate.totalScore !== undefined
                    ? `${selectedCandidate.totalScore} / 45`
                    : 'Not Taken / Pending'}
                  {selectedCandidate.percentage && (
                    <span className="text-sm font-semibold text-blue-600 ml-2">
                      ({selectedCandidate.percentage}%)
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  Rating: <strong>{selectedCandidate.performanceCategory || 'Pending Evaluation'}</strong>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedCandidate.assessmentStatus === 'Terminated'
                    ? 'bg-rose-100 text-rose-700'
                    : selectedCandidate.totalScore >= 27
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedCandidate.assessmentStatus || selectedCandidate.recruitmentStage}
              </span>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Personal & Contact</span>
                <p>
                  <strong>Email:</strong> {selectedCandidate.email}
                </p>
                <p>
                  <strong>Mobile:</strong> {selectedCandidate.mobileNumber}
                </p>
                <p>
                  <strong>Parent:</strong> {selectedCandidate.fatherName || 'N/A'} (
                  {selectedCandidate.emergencyContact || 'N/A'})
                </p>
                <p>
                  <strong>Location:</strong> {selectedCandidate.district || 'N/A'}, {selectedCandidate.state || 'N/A'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Academic Details</span>
                <p>
                  <strong>College:</strong> {selectedCandidate.collegeName}
                </p>
                <p>
                  <strong>Degree:</strong> {selectedCandidate.degree} - {selectedCandidate.department}
                </p>
                <p>
                  <strong>CGPA:</strong> {selectedCandidate.cgpa || '8.2'} • <strong>Grad Year:</strong>{' '}
                  {selectedCandidate.graduationYear || '2026'}
                </p>
                <p>
                  <strong>Standing Arrears:</strong> {selectedCandidate.arrearStatus || 'None'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Recruitment Application</span>
                <p>
                  <strong>Applied Role:</strong> {selectedCandidate.jobRoleTitle}
                </p>
                <p>
                  <strong>Domain:</strong> {selectedCandidate.domainName}
                </p>
                <p>
                  <strong>Preferred Location:</strong> {selectedCandidate.preferredLocation || 'Pan-India'}
                </p>
                <p>
                  <strong>Resume:</strong> {selectedCandidate.resumeFileName || 'Resume.pdf'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Security & Consents</span>
                <p>
                  <strong>Webcam Consent:</strong> Granted
                </p>
                <p>
                  <strong>Recording Consent:</strong> Granted
                </p>
                <p>
                  <strong>Terms Accepted:</strong> Yes
                </p>
                <p>
                  <strong>Registered On:</strong>{' '}
                  {new Date(selectedCandidate.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Campus Drive */}
      {createDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Create New Campus Recruitment Drive</h3>
            <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Drive Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RV College Fresher Tech Drive 2026"
                  value={newDriveData.name}
                  onChange={(e) => setNewDriveData({ ...newDriveData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Affiliated College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RV College of Engineering"
                  value={newDriveData.collegeName}
                  onChange={(e) => setNewDriveData({ ...newDriveData, collegeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Drive Date</label>
                  <input
                    type="date"
                    value={newDriveData.recruitmentDate}
                    onChange={(e) => setNewDriveData({ ...newDriveData, recruitmentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Max Candidates</label>
                  <input
                    type="number"
                    value={newDriveData.maxCandidates}
                    onChange={(e) => setNewDriveData({ ...newDriveData, maxCandidates: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateDriveModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Job Role */}
      {createRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Add New Enterprise Job Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI / ML Engineer"
                  value={newRoleData.title}
                  onChange={(e) => setNewRoleData({ ...newRoleData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROLE-AIML-2026"
                  value={newRoleData.code}
                  onChange={(e) => setNewRoleData({ ...newRoleData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={newRoleData.skills}
                  onChange={(e) => setNewRoleData({ ...newRoleData, skills: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateRoleModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow"
                >
                  Save Job Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
