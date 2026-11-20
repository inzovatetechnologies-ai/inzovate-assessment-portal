import fs from 'fs';
import path from 'path';
import os from 'os';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');

function getCandidates() {
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      return JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
    }
    const seedFrontend = path.join(process.cwd(), 'frontend', 'api', 'data', 'candidates.json');
    if (fs.existsSync(seedFrontend)) {
      return JSON.parse(fs.readFileSync(seedFrontend, 'utf8'));
    }
    const seedRoot = path.join(process.cwd(), 'api', 'data', 'candidates.json');
    if (fs.existsSync(seedRoot)) {
      return JSON.parse(fs.readFileSync(seedRoot, 'utf8'));
    }
  } catch (e) {}
  return [];
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

  try {
    const body = await parseBody(req);
    const identifier = String(body.email || body.username || body.identifier || '').toLowerCase().trim();
    const password = String(body.password || '').trim();

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

    const candidates = getCandidates();
    const candidate = candidates.find(
      c => (c.email && c.email.toLowerCase() === identifier) ||
           (c.candidateId && c.candidateId.toLowerCase() === identifier)
    );

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
        token: 'inz_session_' + Buffer.from(candidate.email).toString('base64'),
        user: {
          id: candidate.candidateId,
          candidateId: candidate.candidateId,
          fullName: candidate.fullName,
          email: candidate.email,
          role: 'Candidate',
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
