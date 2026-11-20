import fs from 'fs';
import path from 'path';
import os from 'os';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) {}
}

const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');

function getAllCandidates() {
  const map = new Map();

  // 1. Load seed candidates
  try {
    const seedPaths = [
      path.join(process.cwd(), 'api', '_data', 'candidates.json'),
      path.join(process.cwd(), 'frontend', 'api', '_data', 'candidates.json'),
      path.join(process.cwd(), '_data', 'candidates.json'),
    ];
    for (const sp of seedPaths) {
      if (fs.existsSync(sp)) {
        const seed = JSON.parse(fs.readFileSync(sp, 'utf8'));
        if (Array.isArray(seed)) {
          for (const c of seed) {
            const key = (c.candidateId || c._id || c.email).toLowerCase();
            map.set(key, c);
          }
        }
        break;
      }
    }
  } catch (e) {}

  // 2. Load runtime saved candidates
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      const live = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
      if (Array.isArray(live)) {
        for (const c of live) {
          const key = (c.candidateId || c._id || c.email).toLowerCase();
          map.set(key, { ...map.get(key), ...c });
        }
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

function saveCandidates(list) {
  try {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(list, null, 2), 'utf8');
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const candidateIdQuery = url.searchParams.get('id') || url.searchParams.get('candidateId');

  // Handle single candidate lookup if query param is set
  if (req.method === 'GET' && candidateIdQuery) {
    const all = getAllCandidates();
    const query = candidateIdQuery.toLowerCase();
    const found = all.find(c =>
      (c.candidateId && c.candidateId.toLowerCase() === query) ||
      (c._id && c._id.toLowerCase() === query) ||
      (c.email && c.email.toLowerCase() === query)
    );
    if (found) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, candidate: found }));
    }
  }

  // Handle sync/batch upsert
  if (req.method === 'POST') {
    try {
      const payload = await parseBody(req);
      const candidatesToSync = Array.isArray(payload) ? payload : (payload.candidates ? payload.candidates : [payload]);
      const current = getAllCandidates();
      const currentMap = new Map();
      for (const c of current) {
        currentMap.set((c.candidateId || c.email).toLowerCase(), c);
      }
      for (const c of candidatesToSync) {
        if (c && (c.candidateId || c.email)) {
          const key = (c.candidateId || c.email).toLowerCase();
          currentMap.set(key, { ...currentMap.get(key), ...c });
        }
      }
      const updated = Array.from(currentMap.values());
      saveCandidates(updated);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, count: updated.length, candidates: updated }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, message: err.message }));
    }
  }

  // List all candidates
  try {
    const candidates = getAllCandidates();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      count: candidates.length,
      candidates
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
