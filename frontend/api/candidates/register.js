import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { getDb, addCandidateToDb } from '../_data/cloudDb.js';
import { getRoleTitleById, getDomainNameById, getDomainByRoleId } from '../_data/rolesData.js';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) {}
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
    const mobile = payload.mobileNumber || payload.mobile;

    if (!payload.email || !payload.fullName || !mobile || !payload.jobRoleId) {
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
    const cleanMobile = String(mobile).trim();
    const rawDigits = cleanMobile.replace(/\D/g, '');

    const db = await getDb(true);
    const candidates = db.candidates || [];

    // Duplicate Check: Active (non-deleted) candidates with matching email or phone
    const existingActiveEmail = candidates.find(
      c => c.status !== 'deleted' && c.email && c.email.toLowerCase() === cleanEmail
    );
    if (existingActiveEmail) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        alreadyRegistered: true,
        message: `Candidate profile is already registered with email '${cleanEmail}' (Candidate ID: ${existingActiveEmail.candidateId}). Please log in directly to attend or view your assessment.`
      }));
    }

    if (rawDigits.length >= 10) {
      const existingActiveMobile = candidates.find(
        c => c.status !== 'deleted' && c.mobileNumber && c.mobileNumber.replace(/\D/g, '').endsWith(rawDigits.slice(-10))
      );
      if (existingActiveMobile) {
        res.statusCode = 409;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: false,
          alreadyRegistered: true,
          message: `Candidate profile is already registered with mobile number '${cleanMobile}' (Candidate ID: ${existingActiveMobile.candidateId}). Please log in directly to attend or view your assessment.`
        }));
      }
    }

    const now = new Date().toISOString();

    const resolvedRoleTitle =
      payload.jobRoleTitle ||
      getRoleTitleById(payload.jobRoleId) ||
      'Software Developer';

    const resolvedDomainName =
      payload.domainName ||
      getDomainNameById(payload.domainId) ||
      getDomainByRoleId(payload.jobRoleId) ||
      'Software Development';

    const newCandidate = {
      _id: 'cand-' + crypto.randomUUID(),
      candidateId: null,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      password: payload.password,
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
      domainName: resolvedDomainName,
      jobRoleId: payload.jobRoleId,
      jobRoleTitle: resolvedRoleTitle,
      preferredLocation: payload.preferredLocation || 'Chennai / Coimbatore',
      recruitmentStage: 'Registered',
      status: 'Registered',
      deletedAt: null,
      assessmentStatus: 'Ready',
      testAttempts: 0,
      createdAt: now,
      updatedAt: now
    };

    // Save to permanent cloud DB (assigns collision-proof candidateId atomically)
    await addCandidateToDb(newCandidate);
    const assignedCandidateId = newCandidate.candidateId;

    const token = 'inz_session_' + Buffer.from(cleanEmail).toString('base64');

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: `Candidate ${newCandidate.fullName} successfully registered for Inzovate Campus Drive 2026.`,
      candidateId: assignedCandidateId,
      token,
      candidate: newCandidate,
      user: {
        id: assignedCandidateId,
        candidateId: assignedCandidateId,
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
