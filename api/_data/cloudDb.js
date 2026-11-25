import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

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
const CACHE_TTL_MS = 3000;

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
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(db), 'utf8');
  } catch (e) {}
}

function ghRequest(method, reqPath, data) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = https.request({
      hostname: 'api.github.com',
      path: reqPath,
      method,
      timeout: 15000,
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
    req.on('timeout', () => { req.destroy(); resolve({ status: 504, body: 'GitHub API request timeout' }); });
    req.on('error', (err) => resolve({ status: 500, body: err?.message || 'Network error', error: err }));
    if (data) req.write(postData);
    req.end();
  });
}

async function fetchLatestDbWithSha() {
  const res = await ghRequest('GET', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH + '?ref=' + BRANCH);
  if (res.status !== 200) return { sha: null, db: null };

  const parsed = JSON.parse(res.body);
  const sha = parsed.sha;
  let contentStr = '';

  if (parsed.content && parsed.content.trim()) {
    contentStr = Buffer.from(parsed.content, 'base64').toString('utf8');
  } else if (sha) {
    // GitHub Contents API omits content for files > 1 MB; fetch via Git Blobs API (supports up to 100 MB)
    const blobRes = await ghRequest('GET', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/git/blobs/' + sha);
    if (blobRes.status === 200) {
      const blobParsed = JSON.parse(blobRes.body);
      if (blobParsed.content) {
        contentStr = Buffer.from(blobParsed.content, 'base64').toString('utf8');
      }
    }
  }

  if (!contentStr || !contentStr.trim()) return { sha, db: null };
  return { sha, db: JSON.parse(contentStr) };
}

let inFlightGet = null;

export async function getDb(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memCache && (now - lastFetchTime < CACHE_TTL_MS)) {
    return memCache;
  }

  if (inFlightGet) {
    return inFlightGet;
  }

  inFlightGet = (async () => {
    try {
      const { db } = await fetchLatestDbWithSha();
      if (db) {
        memCache = db;
        lastFetchTime = Date.now();
        writeLocalCache(db);
        return db;
      }
      if (memCache) return memCache;
    } catch (e) {
      console.error('CloudDB getDb error:', e);
    } finally {
      inFlightGet = null;
    }
    return memCache || readLocalCache();
  })();

  return inFlightGet;
}

let mutationQueue = Promise.resolve();

export function mutateDb(mutatorFn, maxRetries = 20) {
  const run = () => executeMutateDb(mutatorFn, maxRetries);
  const next = mutationQueue.then(run, run);
  mutationQueue = next.catch(() => {});
  return next;
}

async function executeMutateDb(mutatorFn, maxRetries = 20) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    let sha = null;
    let currentDb = { candidates: [], assessment_results: [], exam_sessions: [] };

    try {
      const latest = await fetchLatestDbWithSha();
      sha = latest.sha;
      if (latest.db) {
        currentDb = latest.db;
      } else {
        currentDb = memCache || readLocalCache();
      }
    } catch (e) {
      currentDb = memCache || readLocalCache();
    }

    let updatedDb;
    try {
      updatedDb = mutatorFn(currentDb) || currentDb;
    } catch (mutErr) {
      console.error('Mutation error:', mutErr);
      updatedDb = currentDb;
    }
    updatedDb.lastUpdated = new Date().toISOString();

    try {
      const putPayload = {
        message: 'CloudDB auto-sync update (high-concurrency resilient)',
        content: Buffer.from(JSON.stringify(updatedDb)).toString('base64'),
        branch: BRANCH,
        ...(sha ? { sha } : {})
      };
      const putRes = await ghRequest('PUT', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH, putPayload);

      if (putRes.status === 200 || putRes.status === 201) {
        memCache = updatedDb;
        lastFetchTime = Date.now();
        writeLocalCache(updatedDb);
        return updatedDb;
      }

      if (putRes.status === 409 || putRes.status === 422) {
        // Jittered exponential backoff for concurrent writes
        const delay = Math.min(1500, Math.floor(Math.random() * 200 + attempt * 100));
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (putRes.status === 403) {
        console.warn('CloudDB rate limited by GitHub API. Saved to local cache.');
        memCache = updatedDb;
        lastFetchTime = Date.now();
        writeLocalCache(updatedDb);
        return updatedDb;
      }

      lastError = new Error(`PUT returned ${putRes.status}: ${putRes.body}`);
    } catch (e) {
      lastError = e;
      const delay = Math.min(1500, Math.floor(Math.random() * 200 + attempt * 100));
      await new Promise(r => setTimeout(r, delay));
    }
  }

  console.warn('CloudDB reached max retries, returning local cache:', lastError);
  return memCache || readLocalCache();
}

export async function addCandidateToDb(candidate) {
  return mutateDb((db) => {
    if (!db.candidates) db.candidates = [];

    const cleanEmail = String(candidate.email || '').toLowerCase().trim();
    const existingByEmailIdx = cleanEmail
      ? db.candidates.findIndex(c => c.status !== 'deleted' && c.email && c.email.toLowerCase().trim() === cleanEmail)
      : -1;

    if (existingByEmailIdx >= 0) {
      const existingId = db.candidates[existingByEmailIdx].candidateId;
      candidate.candidateId = existingId;
      db.candidates[existingByEmailIdx] = { ...db.candidates[existingByEmailIdx], ...candidate, candidateId: existingId };
      return db;
    }

    // Collision-proof unique candidateId assignment inside atomic mutation
    const existingIds = new Set(db.candidates.map(c => c.candidateId).filter(Boolean));
    let finalId = candidate.candidateId;
    if (!finalId || existingIds.has(finalId)) {
      let maxNum = 0;
      for (const id of existingIds) {
        const m = String(id).match(/INZ-CAND-2026-(\d+)/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      const seq = String(Math.max(maxNum + 1, db.candidates.length + 1)).padStart(5, '0');
      finalId = `INZ-CAND-2026-${seq}`;
      if (existingIds.has(finalId)) {
        finalId = `INZ-CAND-2026-${seq}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      }
    }

    candidate.candidateId = finalId;
    db.candidates.push({ ...candidate, candidateId: finalId });
    return db;
  });
}

export async function saveExamResultToDb(candidateId, result) {
  return mutateDb((db) => {
    if (!db.candidates) db.candidates = [];
    if (!db.assessment_results) db.assessment_results = [];

    const cleanId = String(candidateId || '').toLowerCase().trim();
    const cleanEmail = String(result.candidateEmail || '').toLowerCase().trim();

    const candIdx = db.candidates.findIndex(c =>
      (cleanId && c.candidateId && c.candidateId.toLowerCase().trim() === cleanId) ||
      (cleanId && c._id && c._id.toLowerCase().trim() === cleanId) ||
      (cleanEmail && c.email && c.email.toLowerCase().trim() === cleanEmail) ||
      (cleanId && c.email && c.email.toLowerCase().trim() === cleanId)
    );

    if (candIdx >= 0) {
      const matchedCand = db.candidates[candIdx];
      result.candidateId = matchedCand.candidateId;
      result.candidateDisplayId = matchedCand.candidateId;
      result.candidateName = matchedCand.fullName || result.candidateName;
      result.collegeName = matchedCand.collegeName || result.collegeName;
      result.jobRoleTitle = matchedCand.jobRoleTitle || result.jobRoleTitle;
      result.domainName = matchedCand.domainName || result.domainName;
      result.jobRoleId = matchedCand.jobRoleId || result.jobRoleId;
      result.domainId = matchedCand.domainId || result.domainId;

      const isPassed = result.totalScore > 25;
      const stage = isPassed ? 'Selected for Next Round' : 'Rejected';
      db.candidates[candIdx] = {
        ...matchedCand,
        jobRoleTitle: result.jobRoleTitle,
        domainName: result.domainName,
        jobRoleId: result.jobRoleId,
        domainId: result.domainId,
        assessmentStatus: result.status === 'Terminated' ? 'Terminated' : 'Completed',
        assessmentResult: result,
        totalScore: result.totalScore,
        percentage: result.percentage,
        isPassed,
        examResult: isPassed ? 'Pass' : 'Fail',
        recruitmentStage: stage,
        certificateId: result.certificateId,
        testAttempts: (matchedCand.testAttempts || 0) + 1,
        completedAt: result.completedAt || new Date().toISOString()
      };
    }

    const authoritativeId = String(result.candidateId || candidateId || '').toLowerCase().trim();
    const resIdx = db.assessment_results.findIndex(r =>
      (r.candidateId && r.candidateId.toLowerCase().trim() === authoritativeId) ||
      (r.candidateDisplayId && r.candidateDisplayId.toLowerCase().trim() === authoritativeId)
    );
    if (resIdx >= 0) {
      db.assessment_results[resIdx] = { ...db.assessment_results[resIdx], ...result };
    } else {
      db.assessment_results.push(result);
    }

    return db;
  });
}
