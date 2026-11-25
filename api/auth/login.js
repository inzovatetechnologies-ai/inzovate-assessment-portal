import { getDb, addCandidateToDb } from '../_data/cloudDb.js';

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    const body = await parseBody(req);
    const identifier = String(body.email || body.username || body.identifier || '').toLowerCase().trim();
    const password = String(body.password || '').trim();
    const candidateData = body.candidateData;

    if (!identifier || !password) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Username / Candidate ID / Email and Password are required.'
      }));
    }

    // 1. Administrator Gateway Sign In
    if (
      identifier === 'admin@inzovate-technologies.com' ||
      identifier === 'admin@inzovate.com' ||
      identifier === 'superadmin@inzovate.com' ||
      identifier === 'admin'
    ) {
      if (password === 'Admin@2026' || password === 'Admin@Inzovate2026') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          token: 'inz_admin_session_root',
          user: {
            id: 'admin-01',
            fullName: 'Enterprise Administrator',
            email: identifier,
            role: 'Admin',
          }
        }));
      }
    }

    const db = await getDb(true);
    let candidates = db.candidates || [];

    // Sync candidateData if provided from client
    if (candidateData && candidateData.email) {
      await addCandidateToDb(candidateData);
      const refreshed = await getDb(true);
      candidates = refreshed.candidates || [];
    }

    // Find candidate by email, candidateId, or 10-digit mobile number (prefer active non-deleted)
    const cleanDigits = identifier.replace(/\D/g, '');
    let candidate = candidates.find(
      c => c.status !== 'deleted' && (
        (c.email && c.email.toLowerCase() === identifier) ||
        (c.candidateId && c.candidateId.toLowerCase() === identifier) ||
        (cleanDigits.length >= 10 && c.mobileNumber && c.mobileNumber.replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      )
    ) || candidates.find(
      c => (c.email && c.email.toLowerCase() === identifier) ||
           (c.candidateId && c.candidateId.toLowerCase() === identifier)
    );

    if (!candidate) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'No registered candidate profile found with this Email / Candidate ID. Please register first.'
      }));
    }

    if (candidate.status === 'deleted') {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'This candidate account has been deleted by administrator. Please complete a fresh registration to attend the assessment.'
      }));
    }

    if (candidate.password && password && candidate.password !== password) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Invalid password. Please check your credentials or reset your password.'
      }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      token: 'inz_session_' + Buffer.from(candidate.email || identifier).toString('base64'),
      user: {
        id: candidate.candidateId || candidate._id,
        candidateId: candidate.candidateId,
        fullName: candidate.fullName,
        email: candidate.email,
        role: 'Candidate',
        jobRoleId: candidate.jobRoleId || 'role-soft-dev',
        jobRoleTitle: candidate.jobRoleTitle || 'Software Developer',
        domainId: candidate.domainId || 'dom-01',
        domainName: candidate.domainName || 'Software Development',
        collegeName: candidate.collegeName || 'Autonomous Engineering College',
        degree: candidate.degree || 'B.E. Computer Science',
        branch: candidate.branch || 'Engineering',
        cgpa: candidate.cgpa || '8.5',
        graduationYear: candidate.yearOfPassing || candidate.graduationYear || '2026',
        assessmentStatus: candidate.assessmentStatus || 'Ready',
        totalScore: candidate.totalScore,
        completedAt: candidate.completedAt || null
      }
    }));

    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'Invalid credentials. Please verify your Email/Candidate ID and Password.'
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
