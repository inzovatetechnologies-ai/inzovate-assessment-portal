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

    // Find candidate by email or candidateId
    let candidate = candidates.find(
      c => (c.email && c.email.toLowerCase() === identifier) ||
           (c.candidateId && c.candidateId.toLowerCase() === identifier)
    );

    // Fallback auto-provision if not found but valid format
    if (!candidate && password.length >= 6) {
      const generatedId = identifier.startsWith('inz-')
        ? identifier.toUpperCase()
        : 'INZ-CAND-2026-' + String(candidates.length + 1).padStart(5, '0');
      const namePart = identifier.includes('@')
        ? identifier.split('@')[0].replace(/[._]/g, ' ')
        : 'Candidate';
      const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      candidate = {
        _id: 'cand-' + Math.random().toString(36).substring(2, 9),
        candidateId: generatedId,
        fullName: cleanName,
        email: identifier.includes('@') ? identifier : `${identifier}@inzovate-candidate.com`,
        password,
        mobileNumber: '+91 98000 00000',
        collegeName: 'Autonomous Engineering College',
        degree: 'B.E. Computer Science and Engineering',
        branch: 'Computer Science',
        yearOfPassing: '2026',
        graduationYear: '2026',
        cgpa: '8.5',
        standingArrears: '0',
        arrearStatus: 'No History',
        driveId: 'INZ-DRIVE-2026-01',
        domainId: 'dom-01',
        domainName: 'Software Development',
        jobRoleId: 'role-soft-dev',
        jobRoleTitle: 'Software Developer',
        recruitmentStage: 'Registered',
        assessmentStatus: 'Ready',
        testAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addCandidateToDb(candidate);
    }

    if (candidate) {
      if (candidate.password && password && candidate.password !== password) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: false,
          message: 'Invalid password. Please check your credentials.'
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
          graduationYear: candidate.yearOfPassing || candidate.graduationYear || '2026'
        }
      }));
    }

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
