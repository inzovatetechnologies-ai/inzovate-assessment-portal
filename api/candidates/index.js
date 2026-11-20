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
  } catch (e) {}
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    const candidates = getCandidates();
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
