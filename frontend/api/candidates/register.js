import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) {}
}

const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');

function getCandidates() {
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      return JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveCandidates(list) {
  try {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save candidates:', e);
  }
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
    return res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
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

    // One-time registration verification
    const existingEmail = candidates.find(c => c.email && c.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: `You have already registered with email '${cleanEmail}' (Candidate ID: ${existingEmail.candidateId}). Please log in.`
      }));
    }

    const existingMobile = candidates.find(c => c.mobileNumber && c.mobileNumber === cleanMobile);
    if (existingMobile) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: `You have already registered with mobile number '${cleanMobile}' (Candidate ID: ${existingMobile.candidateId}). Please log in.`
      }));
    }

    // Generate Sequential Unique Candidate ID: INZ-CAND-2026-XXXXX
    const sequence = String(candidates.length + 1).padStart(5, '0');
    const candidateId = `INZ-CAND-2026-${sequence}`;

    const now = new Date().toISOString();
    const newCandidate = {
      _id: 'cand-' + crypto.randomUUID(),
      candidateId,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      mobileNumber: cleanMobile,
      altMobileNumber: payload.altMobileNumber || '',
      dateOfBirth: payload.dateOfBirth || '',
      gender: payload.gender || 'Not Specified',
      residentialAddress: payload.residentialAddress || '',
      district: payload.district || '',
      state: payload.state || 'Tamil Nadu',
      pinCode: payload.pinCode || '',
      fatherName: payload.fatherName || '',
      fatherMobile: payload.fatherMobile || '',
      motherName: payload.motherName || '',
      emergencyContact: payload.emergencyContact || payload.fatherMobile || '',
      relationship: payload.relationship || 'Parent',
      collegeName: payload.collegeName || 'Affiliated Institution',
      degree: payload.degree || 'B.E.',
      department: payload.department || 'Computer Science and Engineering',
      cgpa: payload.cgpa || '',
      domainId: 'domain-01',
      domainName: 'Technology',
      jobRoleId: payload.jobRoleId,
      jobRoleTitle: 'Software Engineer',
      recruitmentStage: 'Registered',
      isEmailVerified: true,
      isMobileVerified: true,
      termsAccepted: true,
      webcamConsent: true,
      candidateDeclaration: true,
      createdAt: now,
      updatedAt: now,
    };

    candidates.push(newCandidate);
    saveCandidates(candidates);

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: 'Registration successful! Your Candidate ID has been generated.',
      candidateId,
      candidate: newCandidate,
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'Server error during registration: ' + err.message
    }));
  }
}
