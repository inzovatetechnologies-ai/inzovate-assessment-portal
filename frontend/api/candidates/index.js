import { getDb, addCandidateToDb, mutateDb } from '../_data/cloudDb.js';

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

  try {
    const db = await getDb(true);
    const candidates = db.candidates || [];

    // Single candidate lookup
    if (req.method === 'GET' && candidateIdQuery) {
      const query = candidateIdQuery.toLowerCase();
      const found = candidates.find(c =>
        (c.candidateId && c.candidateId.toLowerCase() === query) ||
        (c._id && c._id.toLowerCase() === query) ||
        (c.email && c.email.toLowerCase() === query)
      );
      if (found) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, candidate: found }));
      }
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, message: 'Candidate not found' }));
    }

    // Upsert or sync candidate(s)
    if (req.method === 'POST') {
      const payload = await parseBody(req);
      const candidatesToSync = Array.isArray(payload) ? payload : (payload.candidates ? payload.candidates : [payload]);

      for (const cand of candidatesToSync) {
        if (cand && (cand.email || cand.candidateId)) {
          await addCandidateToDb(cand);
        }
      }

      const updatedDb = await getDb(true);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        count: updatedDb.candidates.length,
        candidates: updatedDb.candidates
      }));
    }

    // List all registered candidates
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
