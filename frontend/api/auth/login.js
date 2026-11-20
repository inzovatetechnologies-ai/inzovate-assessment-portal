const fs = require('fs');
const path = require('path');
const os = require('os');

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');

function getCandidates() {
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      return JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
    }
  } catch (e) {}
  try {
    return require('../data/candidates.json');
  } catch (e) {
    return [];
  }
}

let users = [];
try { users = require('../data/users.json'); } catch (e) { users = []; }

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    const body = await parseBody(req);
    const identifier = String(body.email || body.username || '').toLowerCase().trim();

    const candidates = getCandidates();
    const candidate = candidates.find(
      c => (c.email && c.email.toLowerCase() === identifier) ||
           (c.candidateId && c.candidateId.toLowerCase() === identifier)
    );

    if (candidate) {
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
        },
      }));
    }

    const admin = users.find(
      u => (u.email && u.email.toLowerCase() === identifier) ||
           (u.username && u.username.toLowerCase() === identifier)
    );
    if (admin) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        token: 'inz_admin_session_' + Buffer.from(admin.email).toString('base64'),
        user: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        },
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
};
