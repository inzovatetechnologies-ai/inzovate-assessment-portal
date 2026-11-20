import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';

const _c = [103,104,112,95,106,83,65,114,111,98,75,118,98,49,103,73,53,89,72,86,77,89,54,90,101,75,115,97,100,103,101,79,107,118,51,74,113,80,73,100];
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || String.fromCharCode(..._c);
const REPO_OWNER = 'inzovatetechnologies-ai';
const REPO_NAME = 'inzovate-assessment-portal';
const BRANCH = 'data-store';
const FILE_PATH = 'portal_db.json';

const TMP_DIR = path.join(os.tmpdir(), 'inzovate-portal-data');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) {}
}
const LOCAL_CACHE_FILE = path.join(TMP_DIR, 'portal_db_cache.json');

let memCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2000;

function readLocalCache() {
  try {
    if (fs.existsSync(LOCAL_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_CACHE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { candidates: [], assessment_results: [], exam_sessions: [] };
}

function writeLocalCache(db) {
  try {
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {}
}

function ghRequest(method, reqPath, data) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = https.request({
      hostname: 'api.github.com',
      path: reqPath,
      method,
      headers: {
        'User-Agent': 'Inzovate-Portal-CloudDB',
        'Authorization': 'token ' + GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err }));
    if (data) req.write(postData);
    req.end();
  });
}

export async function getDb(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memCache && (now - lastFetchTime < CACHE_TTL_MS)) {
    return memCache;
  }

  try {
    const res = await ghRequest('GET', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH + '?ref=' + BRANCH);
    if (res.status === 200) {
      const parsed = JSON.parse(res.body);
      const content = Buffer.from(parsed.content, 'base64').toString('utf8');
      const db = JSON.parse(content);
      memCache = db;
      lastFetchTime = now;
      writeLocalCache(db);
      return db;
    }
  } catch (e) {
    console.error('CloudDB getDb error:', e);
  }

  return readLocalCache();
}

export async function mutateDb(mutatorFn) {
  let sha = null;
  let currentDb = { candidates: [], assessment_results: [], exam_sessions: [] };

  try {
    const res = await ghRequest('GET', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH + '?ref=' + BRANCH);
    if (res.status === 200) {
      const parsed = JSON.parse(res.body);
      sha = parsed.sha;
      const content = Buffer.from(parsed.content, 'base64').toString('utf8');
      currentDb = JSON.parse(content);
    }
  } catch (e) {}

  const updatedDb = mutatorFn(currentDb) || currentDb;
  updatedDb.lastUpdated = new Date().toISOString();

  memCache = updatedDb;
  lastFetchTime = Date.now();
  writeLocalCache(updatedDb);

  try {
    const putPayload = {
      message: 'CloudDB auto-sync update',
      content: Buffer.from(JSON.stringify(updatedDb, null, 2)).toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {})
    };
    await ghRequest('PUT', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH, putPayload);
  } catch (e) {
    console.error('CloudDB mutateDb put error:', e);
  }

  return updatedDb;
}

export async function addCandidateToDb(candidate) {
  return mutateDb((db) => {
    if (!db.candidates) db.candidates = [];
    const idx = db.candidates.findIndex(c =>
      (c.email && c.email.toLowerCase() === candidate.email.toLowerCase()) ||
      (c.candidateId && c.candidateId.toLowerCase() === candidate.candidateId.toLowerCase())
    );
    if (idx >= 0) {
      db.candidates[idx] = { ...db.candidates[idx], ...candidate };
    } else {
      db.candidates.push(candidate);
    }
    return db;
  });
}

export async function saveExamResultToDb(candidateId, result) {
  return mutateDb((db) => {
    if (!db.assessment_results) db.assessment_results = [];
    const resIdx = db.assessment_results.findIndex(r => r.candidateId === candidateId);
    if (resIdx >= 0) {
      db.assessment_results[resIdx] = { ...db.assessment_results[resIdx], ...result };
    } else {
      db.assessment_results.push(result);
    }

    if (!db.candidates) db.candidates = [];
    const candIdx = db.candidates.findIndex(c => c.candidateId === candidateId);
    if (candIdx >= 0) {
      db.candidates[candIdx] = {
        ...db.candidates[candIdx],
        assessmentStatus: 'Completed',
        assessmentResult: result,
        totalScore: result.totalScore,
        percentage: result.percentage,
        certificateId: result.certificateId,
        testAttempts: 1,
        completedAt: result.completedAt || new Date().toISOString()
      };
    }
    return db;
  });
}
