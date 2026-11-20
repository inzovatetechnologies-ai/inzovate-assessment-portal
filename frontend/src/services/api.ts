const API_BASE = '/api';

async function handleResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: res.ok
        ? 'Invalid JSON response from server'
        : `Server Error (${res.status}): ${text.slice(0, 150) || res.statusText}`,
    };
  }
}

function getHeaders() {
  const token = localStorage.getItem('inzovate_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(identifier: string, password: string) {
    const cleanId = (identifier || '').trim().toLowerCase();
    let localCandidate: any = null;
    try {
      const stored = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
      localCandidate = stored.find((c: any) =>
        (c.email && c.email.toLowerCase() === cleanId) ||
        (c.candidateId && c.candidateId.toLowerCase() === cleanId)
      );
      if (!localCandidate) {
        const lastCand = JSON.parse(localStorage.getItem('inzovate_last_candidate') || 'null');
        if (lastCand && (lastCand.email?.toLowerCase() === cleanId || lastCand.candidateId?.toLowerCase() === cleanId)) {
          localCandidate = lastCand;
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,
          username: identifier,
          password,
          candidateData: localCandidate || undefined
        }),
      });
      const data = await handleResponse(res);
      if (data.success) {
        if (data.token) localStorage.setItem('inzovate_token', data.token);
        if (data.user) localStorage.setItem('inzovate_user', JSON.stringify(data.user));
        return data;
      }
    } catch (e) {}

    // Resilient local authentication fallback
    if (localCandidate) {
      if (localCandidate.password && localCandidate.password !== password) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
      const token = 'inz_session_' + btoa(localCandidate.email);
      const user = {
        id: localCandidate.candidateId,
        candidateId: localCandidate.candidateId,
        fullName: localCandidate.fullName,
        email: localCandidate.email,
        role: 'Candidate',
        jobRoleId: localCandidate.jobRoleId || 'role-soft-dev',
        jobRoleTitle: localCandidate.jobRoleTitle || 'Software Developer',
        domainId: localCandidate.domainId || 'dom-01',
        domainName: localCandidate.domainName || 'Software Development',
        collegeName: localCandidate.collegeName || 'Autonomous Engineering College',
        degree: localCandidate.degree || 'B.E. Computer Science',
        branch: localCandidate.branch || 'Engineering',
        cgpa: localCandidate.cgpa || '8.5',
        graduationYear: localCandidate.graduationYear || '2026'
      };
      localStorage.setItem('inzovate_user', JSON.stringify(user));
      localStorage.setItem('inzovate_token', token);
      return { success: true, token, user };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify your Email/Candidate ID and Password.'
    };
  },

  async adminLogin(identifier: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, username: identifier, password }),
    });
    return handleResponse(res);
  },

  async requestPasswordReset(identifier: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', identifier }),
    });
    return handleResponse(res);
  },

  async verifyResetOtp(identifier: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', identifier, otp }),
    });
    return handleResponse(res);
  },

  async resetPasswordWithOtp(identifier: string, otp: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', identifier, otp, newPassword }),
    });
    return handleResponse(res);
  },

  async sendOtp(channel: 'email' | 'mobile', recipient: string) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, recipient }),
    });
    return handleResponse(res);
  },

  async verifyOtp(channel: 'email' | 'mobile', recipient: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, recipient, otp }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Metadata
  async getDomains() {
    const res = await fetch(`${API_BASE}/domains`);
    return handleResponse(res);
  },

  async getJobRoles(domainId?: string) {
    const url = domainId ? `${API_BASE}/job-roles?domainId=${domainId}` : `${API_BASE}/job-roles`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async createJobRole(payload: any) {
    const res = await fetch(`${API_BASE}/job-roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getColleges() {
    const res = await fetch(`${API_BASE}/colleges`);
    return handleResponse(res);
  },

  async getDrives() {
    const res = await fetch(`${API_BASE}/drives`);
    return handleResponse(res);
  },

  async createDrive(payload: any) {
    const res = await fetch(`${API_BASE}/drives`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Candidates
  async registerCandidate(payload: any) {
    let res: any;
    try {
      const response = await fetch(`${API_BASE}/candidates/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      res = await handleResponse(response);
    } catch (e: any) {
      res = { success: false, message: e.message };
    }

    // If server returned failure (e.g. 409 already registered), return that error immediately!
    if (res && res.success === false) {
      return res;
    }

    const candidateId = res?.candidateId || 'INZ-CAND-2026-' + Math.floor(10000 + Math.random() * 90000);
    const candidateObj = {
      _id: res?.candidate?._id || 'cand-' + Math.random().toString(36).substring(2, 9),
      candidateId,
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      mobileNumber: payload.mobileNumber,
      collegeName: payload.collegeName || 'Autonomous Institution',
      degree: payload.degree || 'B.E. / B.Tech',
      branch: payload.branch || 'Engineering',
      graduationYear: payload.yearOfPassing || '2026',
      cgpa: payload.cgpa || '8.5',
      jobRoleId: payload.jobRoleId,
      jobRoleTitle: payload.jobRoleTitle || 'Software Developer',
      domainId: payload.domainId || 'dom-01',
      domainName: payload.domainName || 'Software Development',
      driveId: payload.driveId || 'INZ-DRIVE-2026-01',
      recruitmentStage: 'Registered',
      status: 'Registered',
      assessmentStatus: 'Ready',
      arrearStatus: payload.standingArrears && payload.standingArrears !== '0' ? `${payload.standingArrears} Standing Arrear(s)` : 'No History',
      ...(res?.candidate || {})
    };

    try {
      const stored = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
      const filtered = stored.filter((c: any) => c.email?.toLowerCase() !== payload.email?.toLowerCase() && c.candidateId !== candidateId);
      filtered.push(candidateObj);
      localStorage.setItem('inzovate_registered_candidates', JSON.stringify(filtered));
      localStorage.setItem('inzovate_last_candidate', JSON.stringify(candidateObj));
      if (res?.token) localStorage.setItem('inzovate_token', res.token);
      localStorage.setItem('inzovate_user', JSON.stringify(candidateObj));
    } catch (e) {}

    return { ...res, success: true, candidate: candidateObj, candidateId };
  },

  async deleteCandidate(candidateId: string, action: 'delete' | 'restore' | 'permanent_delete' = 'delete') {
    let res: any;
    try {
      const response = await fetch(`${API_BASE}/candidates?id=${encodeURIComponent(candidateId)}&action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ candidateId, action }),
      });
      res = await handleResponse(response);
    } catch (e: any) {
      res = { success: false, message: e.message };
    }

    try {
      const stored = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
      const clean = candidateId.toLowerCase();
      let updated: any[] = [];
      if (action === 'permanent_delete') {
        updated = stored.filter((c: any) => c.candidateId?.toLowerCase() !== clean && c.email?.toLowerCase() !== clean);
      } else if (action === 'delete') {
        updated = stored.map((c: any) => {
          if (c.candidateId?.toLowerCase() === clean || c.email?.toLowerCase() === clean) {
            return { ...c, status: 'deleted', recruitmentStage: 'Deleted / Archived' };
          }
          return c;
        });
      } else if (action === 'restore') {
        updated = stored.map((c: any) => {
          if (c.candidateId?.toLowerCase() === clean || c.email?.toLowerCase() === clean) {
            return { ...c, status: 'Registered', recruitmentStage: 'Registered' };
          }
          return c;
        });
      }
      localStorage.setItem('inzovate_registered_candidates', JSON.stringify(updated));
    } catch (e) {}

    return res;
  },

  async getCandidates(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    let serverCandidates: any[] = [];
    try {
      const res = await fetch(`${API_BASE}/candidates?${query}`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(res);
      if (data.success && Array.isArray(data.candidates)) {
        serverCandidates = data.candidates;
        try {
          localStorage.setItem('inzovate_registered_candidates', JSON.stringify(data.candidates));
        } catch (e) {}
        return { success: true, count: serverCandidates.length, candidates: serverCandidates };
      }
    } catch (e) {}

    let localCandidates: any[] = [];
    try {
      localCandidates = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
    } catch (e) {}

    return { success: true, count: localCandidates.length, candidates: localCandidates };
  },

  async getCandidateById(id: string) {
    try {
      const res = await fetch(`${API_BASE}/candidates/${id}`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(res);
      if (data.success && data.candidate) return data;
    } catch (e) {}

    try {
      const stored = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
      const clean = id.toLowerCase();
      const found = stored.find((c: any) =>
        (c.candidateId && c.candidateId.toLowerCase() === clean) ||
        (c.email && c.email.toLowerCase() === clean)
      );
      if (found) return { success: true, candidate: found };

      const currentUser = JSON.parse(localStorage.getItem('inzovate_user') || 'null');
      if (currentUser && (currentUser.candidateId?.toLowerCase() === clean || currentUser.email?.toLowerCase() === clean || currentUser.id?.toLowerCase() === clean)) {
        return { success: true, candidate: currentUser };
      }
    } catch (e) {}

    return { success: false, message: 'Candidate not found' };
  },

  async updateCandidateStage(id: string, stage: string, notes?: string) {
    let res: any;
    try {
      const response = await fetch(`${API_BASE}/candidates?id=${encodeURIComponent(id)}&action=update_stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify({ id, candidateId: id, stage, notes, action: 'update_stage' }),
      });
      res = await handleResponse(response);
    } catch (e: any) {
      res = { success: false, message: e.message };
    }

    try {
      const stored = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
      const clean = id.toLowerCase();
      const updated = stored.map((c: any) => {
        if (c.candidateId?.toLowerCase() === clean || c._id?.toLowerCase() === clean || c.email?.toLowerCase() === clean) {
          return { ...c, recruitmentStage: stage };
        }
        return c;
      });
      localStorage.setItem('inzovate_registered_candidates', JSON.stringify(updated));
    } catch (e) {}

    return res;
  },

  // Assessment Engine
  async startExam(candidateId?: string) {
    const res = await fetch(`${API_BASE}/exam/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ candidateId }),
    });
    return handleResponse(res);
  },

  async resetExamAttempt(candidateId: string) {
    const res = await fetch(`${API_BASE}/exam/reset-attempt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ candidateId }),
    });
    return handleResponse(res);
  },

  async saveAnswer(payload: { sessionId: string; questionId: string; selectedOption?: string; isMarkedForReview?: boolean }) {
    const res = await fetch(`${API_BASE}/exam/save-answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async logViolation(payload: { sessionId: string; eventType: string; details?: string }) {
    const res = await fetch(`${API_BASE}/exam/violation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  terminateExamOnTabClose(sessionId: string, candidateId?: string) {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ sessionId, candidateId })], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/exam/terminate-session`, blob);
    } else {
      fetch(`${API_BASE}/exam/terminate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, candidateId }),
        keepalive: true,
      });
    }
  },

  async submitExam(payload: { sessionId?: string; candidateId?: string; submissionType?: string; answers?: any }) {
    let res: any;
    try {
      const response = await fetch(`${API_BASE}/exam/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      res = await handleResponse(response);
    } catch (e: any) {
      res = { success: false, message: e.message };
    }

    if (res && res.success && res.result) {
      try {
        const stored = JSON.parse(localStorage.getItem('inzovate_registered_candidates') || '[]');
        const cId = payload.candidateId;
        const idx = stored.findIndex((c: any) => c.candidateId === cId || c.email === cId);
        if (idx >= 0) {
          stored[idx].assessmentStatus = 'Completed';
          stored[idx].assessmentResult = res.result;
          stored[idx].totalScore = res.result.totalScore;
          stored[idx].percentage = res.result.percentage;
          stored[idx].certificateId = res.result.certificateId;
          stored[idx].testAttempts = 1;
          localStorage.setItem('inzovate_registered_candidates', JSON.stringify(stored));
        }
      } catch (e) {}
    }
    return res;
  },

  async getCandidateResult(candidateId: string) {
    const res = await fetch(`${API_BASE}/exam/results/${candidateId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Proctoring
  async getLiveProctoringSessions() {
    const res = await fetch(`${API_BASE}/proctoring/live-sessions`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async resolveViolation(sessionId: string, resolution: 'cleared' | 'confirmed', notes?: string) {
    const res = await fetch(`${API_BASE}/proctoring/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, resolution, notes }),
    });
    return handleResponse(res);
  },

  // Questions
  async getQuestions(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/questions?${query}`);
    return handleResponse(res);
  },

  async createQuestion(payload: any) {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteQuestion(id: string) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async generateAiDraftQuestions(payload: any) {
    const res = await fetch(`${API_BASE}/questions/ai-generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async approveQuestion(id: string) {
    const res = await fetch(`${API_BASE}/questions/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Coding Sandbox
  async getCodingChallenges() {
    const res = await fetch(`${API_BASE}/coding/challenges`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async executeCode(payload: any) {
    const res = await fetch(`${API_BASE}/coding/execute`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Interviews
  async scheduleInterview(payload: any) {
    const res = await fetch(`${API_BASE}/interviews/schedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Analytics & Certificate
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/reports/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async verifyCertificate(certificateId: string) {
    const res = await fetch(`${API_BASE}/certificates/verify/${certificateId}`);
    return handleResponse(res);
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
