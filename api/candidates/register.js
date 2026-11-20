import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) {}
}

const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');
const USERS_FILE = path.join(TMP_DIR, 'users.json');

function getCandidates() {
  const list = [];
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      const data = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
      if (Array.isArray(data)) list.push(...data);
    }
  } catch (e) {}

  if (list.length === 0) {
    try {
      const seedPaths = [
        path.join(process.cwd(), 'api', '_data', 'candidates.json'),
        path.join(process.cwd(), 'frontend', 'api', '_data', 'candidates.json'),
        path.join(process.cwd(), '_data', 'candidates.json'),
      ];
      for (const sp of seedPaths) {
        if (fs.existsSync(sp)) {
          const seed = JSON.parse(fs.readFileSync(sp, 'utf8'));
          if (Array.isArray(seed) && seed.length > 0) {
            list.push(...seed);
            break;
          }
        }
      }
    } catch (e) {}
  }
  return list;
}

function saveCandidates(list) {
  try {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save candidates:', e);
  }
}

function saveUser(userObj) {
  try {
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
    const idx = users.findIndex(u => u.email === userObj.email || u.candidateId === userObj.candidateId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...userObj };
    } else {
      users.push(userObj);
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
}

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

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
  }

  try {
    const payload = await parseBody(req);

    if (!payload.email || !payload.fullName || !payload.mobileNumber || !payload.jobRoleId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Required fields missing: Full Name, Email, Mobile, and Applied Job Role are mandatory.'
      }));
    }

    if (!payload.password || payload.password.length < 6) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Please choose a secure password of at least 6 characters.'
      }));
    }

    const cleanEmail = String(payload.email).toLowerCase().trim();
    const cleanMobile = String(payload.mobileNumber).trim();
    const candidates = getCandidates();

    const existingEmail = candidates.find(c => c.email && c.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      // If already registered, return existing profile and password credentials so login succeeds
      const token = 'inz_session_' + Buffer.from(cleanEmail).toString('base64');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        alreadyRegistered: true,
        message: `Candidate profile already exists for ${cleanEmail}. Ready for sign in.`,
        candidateId: existingEmail.candidateId,
        token,
        candidate: existingEmail,
        user: {
          id: existingEmail.candidateId,
          candidateId: existingEmail.candidateId,
          fullName: existingEmail.fullName,
          email: existingEmail.email,
          role: 'Candidate',
          jobRoleId: existingEmail.jobRoleId,
          jobRoleTitle: existingEmail.jobRoleTitle,
          domainId: existingEmail.domainId,
          domainName: existingEmail.domainName,
          collegeName: existingEmail.collegeName,
          degree: existingEmail.degree,
          branch: existingEmail.branch,
          cgpa: existingEmail.cgpa,
          graduationYear: existingEmail.yearOfPassing || existingEmail.graduationYear
        }
      }));
    }

    const sequence = String(candidates.length + 1).padStart(5, '0');
    const candidateId = `INZ-CAND-2026-${sequence}`;

    const now = new Date().toISOString();
    const newCandidate = {
      _id: 'cand-' + crypto.randomUUID(),
      candidateId,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      password: payload.password, // Persist password for login authentication
      mobileNumber: cleanMobile,
      altMobileNumber: payload.altMobileNumber || '',
      dateOfBirth: payload.dateOfBirth || '',
      gender: payload.gender || 'Not Specified',
      residentialAddress: payload.residentialAddress || '',
      district: payload.district || '',
      state: payload.state || 'Tamil Nadu',
      pinCode: payload.pinCode || '',
      collegeId: payload.collegeId || '',
      collegeName: payload.collegeName || 'Autonomous Institution',
      universityRegisterNumber: payload.universityRegisterNumber || '',
      degree: payload.degree || 'B.E. / B.Tech',
      branch: payload.branch || 'Engineering',
      yearOfPassing: payload.yearOfPassing || '2026',
      graduationYear: payload.yearOfPassing || '2026',
      cgpa: payload.cgpa || '8.5',
      sslcPercentage: payload.sslcPercentage || '',
      hscPercentage: payload.hscPercentage || '',
      standingArrears: payload.standingArrears || '0',
      arrearStatus: payload.standingArrears && payload.standingArrears !== '0' ? `${payload.standingArrears} Standing Arrear(s)` : 'No History',
      historyOfArrears: payload.historyOfArrears || '0',
      driveId: payload.driveId || 'INZ-DRIVE-2026-01',
      domainId: payload.domainId || 'dom-01',
      domainName: payload.domainName || 'Software Development',
      jobRoleId: payload.jobRoleId,
      jobRoleTitle: payload.jobRoleTitle || 'Process Associate',
      preferredLocation: payload.preferredLocation || 'Chennai / Coimbatore',
      recruitmentStage: 'Registered',
      assessmentStatus: 'Ready',
      testAttempts: 0,
      createdAt: now,
      updatedAt: now
    };

    candidates.push(newCandidate);
    saveCandidates(candidates);

    saveUser({
      id: newCandidate._id,
      candidateId,
      fullName: newCandidate.fullName,
      email: cleanEmail,
      password: payload.password,
      role: 'Candidate'
    });

    const token = 'inz_session_' + Buffer.from(cleanEmail).toString('base64');

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: `Candidate ${newCandidate.fullName} successfully registered for Inzovate Campus Drive 2026.`,
      candidateId,
      token,
      candidate: newCandidate,
      user: {
        id: candidateId,
        candidateId,
        fullName: newCandidate.fullName,
        email: cleanEmail,
        role: 'Candidate',
        jobRoleId: newCandidate.jobRoleId,
        jobRoleTitle: newCandidate.jobRoleTitle,
        domainId: newCandidate.domainId,
        domainName: newCandidate.domainName,
        collegeName: newCandidate.collegeName,
        degree: newCandidate.degree,
        branch: newCandidate.branch,
        cgpa: newCandidate.cgpa,
        graduationYear: newCandidate.yearOfPassing
      }
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
