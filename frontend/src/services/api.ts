const API_BASE = '/api';

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
    return res.json();
  },

  async adminLogin(identifier: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, username: identifier, password }),
    });
    return res.json();
  },

  async requestPasswordReset(identifier: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    return res.json();
  },

  async verifyResetOtp(identifier: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp }),
    });
    return res.json();
  },

  async resetPasswordWithOtp(identifier: string, otp: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp, newPassword }),
    });
    return res.json();
  },

  async sendOtp(channel: 'email' | 'mobile', recipient: string) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, recipient }),
    });
    return res.json();
  },

  async verifyOtp(channel: 'email' | 'mobile', recipient: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, recipient, otp }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Metadata
  async getDomains() {
    const res = await fetch(`${API_BASE}/domains`);
    return res.json();
  },

  async getJobRoles(domainId?: string) {
    const url = domainId ? `${API_BASE}/job-roles?domainId=${domainId}` : `${API_BASE}/job-roles`;
    const res = await fetch(url);
    return res.json();
  },

  async createJobRole(payload: any) {
    const res = await fetch(`${API_BASE}/job-roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getColleges() {
    const res = await fetch(`${API_BASE}/colleges`);
    return res.json();
  },

  async getDrives() {
    const res = await fetch(`${API_BASE}/drives`);
    return res.json();
  },

  async createDrive(payload: any) {
    const res = await fetch(`${API_BASE}/drives`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Candidates
  async registerCandidate(payload: any) {
    const res = await fetch(`${API_BASE}/candidates/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getCandidates(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/candidates?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getCandidateById(id: string) {
    const res = await fetch(`${API_BASE}/candidates/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateCandidateStage(id: string, stage: string, notes?: string) {
    const res = await fetch(`${API_BASE}/candidates/${id}/stage`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stage, notes }),
    });
    return res.json();
  },

  // Assessment Engine
  async startExam(candidateId?: string) {
    const res = await fetch(`${API_BASE}/exam/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ candidateId }),
    });
    return res.json();
  },

  async resetExamAttempt(candidateId: string) {
    const res = await fetch(`${API_BASE}/exam/reset-attempt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ candidateId }),
    });
    return res.json();
  },

  async saveAnswer(payload: { sessionId: string; questionId: string; selectedOption?: string; isMarkedForReview?: boolean }) {
    const res = await fetch(`${API_BASE}/exam/save-answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async logViolation(payload: { sessionId: string; eventType: string; details?: string }) {
    const res = await fetch(`${API_BASE}/exam/violation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
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
    return res.json();
  },

  async getCandidateResult(candidateId: string) {
    const res = await fetch(`${API_BASE}/exam/results/${candidateId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Proctoring
  async getLiveProctoringSessions() {
    const res = await fetch(`${API_BASE}/proctoring/live-sessions`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async resolveViolation(sessionId: string, resolution: 'cleared' | 'confirmed', notes?: string) {
    const res = await fetch(`${API_BASE}/proctoring/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, resolution, notes }),
    });
    return res.json();
  },

  // Questions
  async getQuestions(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/questions?${query}`);
    return res.json();
  },

  async createQuestion(payload: any) {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteQuestion(id: string) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async generateAiDraftQuestions(payload: any) {
    const res = await fetch(`${API_BASE}/questions/ai-generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async approveQuestion(id: string) {
    const res = await fetch(`${API_BASE}/questions/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Coding Sandbox
  async getCodingChallenges() {
    const res = await fetch(`${API_BASE}/coding/challenges`, { headers: getHeaders() });
    return res.json();
  },

  async executeCode(payload: any) {
    const res = await fetch(`${API_BASE}/coding/execute`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Interviews
  async scheduleInterview(payload: any) {
    const res = await fetch(`${API_BASE}/interviews/schedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Analytics & Certificate
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/reports/analytics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async verifyCertificate(certificateId: string) {
    const res = await fetch(`${API_BASE}/certificates/verify/${certificateId}`);
    return res.json();
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getHeaders(),
    });
    return res.json();
  },
};
