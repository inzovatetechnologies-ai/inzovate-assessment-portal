import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
const CANDIDATES_FILE = path.join(TMP_DIR, 'candidates.json');
const STATIC_CANDIDATES_FILE = path.join(__dirname, '..', 'data', 'candidates.json');
const RESULTS_FILE = path.join(__dirname, '..', 'data', 'assessment_results.json');

function getAllCandidates() {
  const map = new Map();
  // Load static baseline candidates
  try {
    if (fs.existsSync(STATIC_CANDIDATES_FILE)) {
      const staticList = JSON.parse(fs.readFileSync(STATIC_CANDIDATES_FILE, 'utf8'));
      for (const c of staticList) {
        if (c.candidateId) map.set(c.candidateId, c);
      }
    }
  } catch (e) {}

  // Merge runtime candidates from tmpdir
  try {
    if (fs.existsSync(CANDIDATES_FILE)) {
      const liveList = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
      for (const c of liveList) {
        if (c.candidateId) map.set(c.candidateId, c);
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

function getResults() {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  try {
    const candidates = getAllCandidates();
    const results = getResults();
    const resultMap = new Map(results.map(r => [r.candidateDisplayId, r]));

    const enriched = candidates.map(c => {
      const r = resultMap.get(c.candidateId);
      return {
        ...c,
        assessmentResult: r || null
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      count: enriched.length,
      candidates: enriched
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
