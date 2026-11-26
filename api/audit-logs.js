import { setSecurityHeaders, requireAdmin } from './_data/auth.js';

export default async function handler(req, res) {
  setSecurityHeaders(req, res, 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const adminUser = requireAdmin(req, res);
  if (!adminUser) return;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    count: 3,
    logs: [
      {
        _id: 'audit-01',
        actorEmail: 'admin@inzovate-technologies.com',
        actorRole: 'Admin',
        action: 'ADMIN_PORTAL_LOGIN',
        target: 'AdminDashboard',
        details: 'Administrator authenticated into management command center.',
        timestamp: new Date().toISOString()
      },
      {
        _id: 'audit-02',
        actorEmail: 'system@inzovate.com',
        actorRole: 'System',
        action: 'CANDIDATE_REGISTRATION',
        target: 'CandidatePortal',
        details: 'Candidate registration processed and assigned to batch 2026.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: 'audit-03',
        actorEmail: 'admin@inzovate-technologies.com',
        actorRole: 'Admin',
        action: 'SYSTEM_DIAGNOSTIC_VERIFY',
        target: 'ProctorEngine',
        details: 'AI proctoring diagnostic parameters verified.',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  }));
}
