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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, username: identifier, password }),
    });
    return handleResponse(res);
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
    const res = await fetch(`${API_BASE}/candidates/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getCandidates(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/candidates?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getCandidateById(id: string) {
    const res = await fetch(`${API_BASE}/candidates/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateCandidateStage(id: string, stage: string, notes?: string) {
    const res = await fetch(`${API_BASE}/candidates/${id}/stage`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stage, notes }),
    });
    return handleResponse(res);
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

  async submitExam(payload: { sessionId?: string; candidateId?: string; submissionType?: string }) {
    const res = await fetch(`${API_BASE}/exam/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
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
