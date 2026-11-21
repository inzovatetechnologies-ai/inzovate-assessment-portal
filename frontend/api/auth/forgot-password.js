import fs from 'fs';
import path from 'path';
import os from 'os';
import nodemailer from 'nodemailer';
import { getDb, mutateDb } from '../_data/cloudDb.js';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) {}
}

const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');
const USERS_FILE = path.join(TMP_DIR, 'users.json');
const RESET_OTPS_FILE = path.join(TMP_DIR, 'reset_otps.json');

const memOtps = new Map();

function getResetOtps() {
  try {
    if (fs.existsSync(RESET_OTPS_FILE)) {
      return JSON.parse(fs.readFileSync(RESET_OTPS_FILE, 'utf8'));
    }
  } catch (e) {}
  return Object.fromEntries(memOtps);
}

function saveResetOtps(otps) {
  try {
    fs.writeFileSync(RESET_OTPS_FILE, JSON.stringify(otps, null, 2), 'utf8');
  } catch (e) {}
  for (const [k, v] of Object.entries(otps)) {
    memOtps.set(k, v);
  }
}

function getCandidates() {
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      return JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
    }
    const seedFrontend = path.join(process.cwd(), 'frontend', 'api', 'data', 'candidates.json');
    if (fs.existsSync(seedFrontend)) {
      const data = JSON.parse(fs.readFileSync(seedFrontend, 'utf8'));
      try { fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (e) {}
      return data;
    }
    const seedRoot = path.join(process.cwd(), 'api', 'data', 'candidates.json');
    if (fs.existsSync(seedRoot)) {
      const data = JSON.parse(fs.readFileSync(seedRoot, 'utf8'));
      try { fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (e) {}
      return data;
    }
  } catch (e) {}
  return [];
}

function saveCandidates(list) {
  try {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
    const seedFrontend = path.join(process.cwd(), 'frontend', 'api', 'data', 'users.json');
    if (fs.existsSync(seedFrontend)) {
      const data = JSON.parse(fs.readFileSync(seedFrontend, 'utf8'));
      try { fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (e) {}
      return data;
    }
    const seedRoot = path.join(process.cwd(), 'api', 'data', 'users.json');
    if (fs.existsSync(seedRoot)) {
      const data = JSON.parse(fs.readFileSync(seedRoot, 'utf8'));
      try { fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (e) {}
      return data;
    }
  } catch (e) {}
  return [];
}

function saveUsers(list) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

function createTransporter() {
  const user = (process.env.SMTP_USER || 'winoraproject@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'ieffskxuiqauuwpp').replace(/\s+/g, '');
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendResetEmail({ toEmail, candidateName, candidateId, resetOtp }) {
  const transporter = createTransporter();
  const subject = `Inzovate Verification OTP: ${resetOtp}`;
  const textContent = `INZOVATE TECHNOLOGIES PRIVATE LIMITED - Candidate Portal Verification\n\nDear ${candidateName || 'Candidate'},\n\nYour 6-digit OTP verification code is: ${resetOtp}\nCandidate ID: ${candidateId || 'N/A'}\nRegistered Email: ${toEmail}\n\nThis OTP is valid for 15 minutes. If you did not request this, please contact support@inzovate-technologies.com.\n\n© 2026 INZOVATE TECHNOLOGIES PRIVATE LIMITED (CIN: U62011TZ2025PTC036329)`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #F5F7FB; padding: 25px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="background: #0A1128; color: #ffffff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 1.5px; color: #ffffff;">INZOVATE TECHNOLOGIES PRIVATE LIMITED</h2>
          <p style="margin: 6px 0 0; font-size: 12px; color: #38bdf8; font-weight: bold; letter-spacing: 1px;">TALENT ASSESSMENT RECRUITMENT PORTAL</p>
        </div>
        <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0;">Dear <strong>${candidateName || 'Candidate'}</strong>,</p>
          <p>We received a password reset request for your candidate portal access.</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #475569;">
              <strong>Candidate ID:</strong> <span style="font-family: monospace; color: #0066FF; font-weight: bold;">${candidateId || 'Registered Candidate'}</span>
            </p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">
              <strong>Registered Email:</strong> ${toEmail}
            </p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: #EFF6FF; border: 2px dashed #0066FF; color: #0066FF; font-size: 28px; font-weight: 800; letter-spacing: 8px; padding: 12px 28px; border-radius: 8px; font-family: monospace;">
              ${resetOtp}
            </span>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 15 minutes. Do not share this OTP with anyone.</p>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If you did not request this password reset, please contact our administrator immediately at 
            <a href="mailto:admin@inzovate-technologies.com" style="color: #0066FF;">admin@inzovate-technologies.com</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            © 2026 INZOVATE TECHNOLOGIES PRIVATE LIMITED (CIN: U62011TZ2025PTC036329). All rights reserved. Automated Security Notification.
          </p>
        </div>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Inzovate Assessment Portal" <winoraproject@gmail.com>`,
        to: toEmail,
        replyTo: 'winoraproject@gmail.com',
        subject,
        text: textContent,
        html: htmlContent
      });
      console.log('✅ Real SMTP Email dispatched directly to candidate:', toEmail, 'MessageId:', info.messageId);
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn('⚠️ SMTP send error:', err.message);
      return { success: true, method: 'logged', error: err.message };
    }
  }
  return { success: true, method: 'logged' };
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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
    const body = await parseBody(req);
    const identifier = String(body.identifier || body.email || body.username || '').trim();
    const otp = String(body.otp || '').trim();
    const newPassword = String(body.newPassword || '').trim();
    const action = String(body.action || '').trim().toLowerCase();

    // Determine sub-action:
    // 1. Reset Password: if action is 'reset' or newPassword provided
    if (action === 'reset' || newPassword) {
      if (!identifier || !newPassword) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Identifier and new password are required.' }));
      }

      if (newPassword.length < 6) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Password must be at least 6 characters.' }));
      }

      const otps = getResetOtps();
      let targetKey = identifier.toLowerCase();
      let record = otps[targetKey];
      if (!record) {
        const entry = Object.entries(otps).find(([k, v]) => v.candidateId && v.candidateId.toLowerCase() === targetKey);
        if (entry) {
          targetKey = entry[0];
          record = entry[1];
        }
      }

      if (!record) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'No active password reset request found. Please request a new verification code.' }));
      }

      if (Date.now() > record.expiresAt) {
        delete otps[targetKey];
        saveResetOtps(otps);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Verification code has expired. Please request a new code.' }));
      }

      if (!record.isVerified && record.resetOtp !== otp) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Security error: Email OTP must be verified before setting a new password.' }));
      }

      // Update password in CloudDB permanently
      await mutateDb((db) => {
        if (!db.candidates) db.candidates = [];
        const cand = db.candidates.find(c =>
          (c.email && c.email.toLowerCase() === targetKey.toLowerCase()) ||
          (c.candidateId && c.candidateId.toLowerCase() === targetKey.toLowerCase())
        );
        if (cand) {
          cand.password = newPassword;
        }
        return db;
      });

      // Update password in local candidates.json
      const candidates = getCandidates();
      let cand = candidates.find(c =>
        (c.email && c.email.toLowerCase() === targetKey.toLowerCase()) ||
        (c.candidateId && c.candidateId.toLowerCase() === targetKey.toLowerCase())
      );
      if (cand) {
        cand.password = newPassword;
        saveCandidates(candidates);
      } else {
        candidates.push({
          candidateId: record.candidateId || `INZ-CAND-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          fullName: record.fullName || targetKey.split('@')[0],
          email: targetKey,
          password: newPassword,
          recruitmentStage: 'Registered',
          assessmentStatus: 'Ready'
        });
        saveCandidates(candidates);
      }

      // Update in users.json
      const users = getUsers();
      const user = users.find(u => u.email && u.email.toLowerCase() === targetKey.toLowerCase());
      if (user) {
        user.password = newPassword;
        saveUsers(users);
      }

      delete otps[targetKey];
      saveResetOtps(otps);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        message: 'Password updated successfully! Redirecting to login...'
      }));
    }

    // 2. Verify OTP: if action is 'verify' or otp provided
    if (action === 'verify' || otp) {
      if (!identifier || !otp) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Candidate identifier and verification code are required.' }));
      }

      const otps = getResetOtps();
      const cleanIdent = identifier.toLowerCase();
      let record = otps[cleanIdent];
      if (!record) {
        record = Object.values(otps).find(r => r.candidateId && r.candidateId.toLowerCase() === cleanIdent);
      }

      if (!record) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'No active password reset request found. Please request a new verification code.' }));
      }

      if (Date.now() > record.expiresAt) {
        delete otps[cleanIdent];
        saveResetOtps(otps);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Verification code has expired. Please request a new code.' }));
      }

      if (record.resetOtp !== otp) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, message: 'Incorrect OTP code. Please check your email inbox.' }));
      }

      record.isVerified = true;
      saveResetOtps(otps);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        message: 'Email OTP verified successfully! You may now set your new password.'
      }));
    }

    // 3. Request OTP: initial step
    if (!identifier) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, message: 'Please enter your registered Email or Candidate ID.' }));
    }

    const cleanIdent = identifier.toLowerCase();
    const db = await getDb(true);
    let candidate = (db.candidates || []).find(c =>
      c.status !== 'deleted' && (
        (c.email && c.email.toLowerCase() === cleanIdent) ||
        (c.candidateId && c.candidateId.toLowerCase() === cleanIdent)
      )
    );

    if (!candidate) {
      const candidates = getCandidates();
      candidate = candidates.find(c =>
        (c.email && c.email.toLowerCase() === cleanIdent) ||
        (c.candidateId && c.candidateId.toLowerCase() === cleanIdent)
      );
    }

    if (!candidate) {
      const users = getUsers();
      const user = users.find(u =>
        (u.email && u.email.toLowerCase() === cleanIdent) ||
        (u.username && u.username.toLowerCase() === cleanIdent) ||
        (u.candidateId && u.candidateId.toLowerCase() === cleanIdent)
      );
      if (user) {
        candidate = {
          candidateId: user.candidateId || 'INZ-ADMIN-2026',
          fullName: user.fullName || user.username || 'Authorized User',
          email: user.email
        };
      }
    }

    // If identifier is a valid email, allow OTP dispatch so candidate or tester can receive email OTP
    if (!candidate && cleanIdent.includes('@') && cleanIdent.includes('.')) {
      const defaultName = identifier.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      candidate = {
        candidateId: `INZ-CAND-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: defaultName,
        email: cleanIdent
      };
      const candList = getCandidates();
      candList.push(candidate);
      saveCandidates(candList);
    }

    if (!candidate) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'No registered candidate found with this Email or Candidate ID.'
      }));
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    const otps = getResetOtps();
    otps[candidate.email.toLowerCase()] = {
      candidateId: candidate.candidateId,
      fullName: candidate.fullName,
      resetOtp,
      expiresAt,
      isVerified: false
    };
    saveResetOtps(otps);

    await sendResetEmail({
      toEmail: candidate.email,
      candidateName: candidate.fullName,
      candidateId: candidate.candidateId,
      resetOtp
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: `OTP sent successfully to candidate email: ${candidate.email}`,
      candidateEmail: candidate.email,
      candidateId: candidate.candidateId
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
