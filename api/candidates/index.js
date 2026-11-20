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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const candidateIdQuery = url.searchParams.get('id') || url.searchParams.get('candidateId');
  const actionQuery = url.searchParams.get('action');

  try {
    const db = await getDb(true);
    const candidates = db.candidates || [];

    // 1. Single candidate lookup
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

    // 2. Candidate Management: Delete / Restore / Permanent Delete
    let payload = {};
    if (req.method !== 'GET') {
      payload = await parseBody(req);
    }
    const targetId = candidateIdQuery || payload.candidateId || payload.id;
    const action = actionQuery || payload.action || (req.method === 'DELETE' ? 'delete' : null);

    if (action && targetId) {
      const cleanTarget = String(targetId).toLowerCase();

      if (action === 'delete') {
        const updatedDb = await mutateDb((current) => {
          if (!current.candidates) current.candidates = [];
          const idx = current.candidates.findIndex(c =>
            (c.candidateId && c.candidateId.toLowerCase() === cleanTarget) ||
            (c._id && c._id.toLowerCase() === cleanTarget) ||
            (c.email && c.email.toLowerCase() === cleanTarget)
          );
          if (idx >= 0) {
            current.candidates[idx].status = 'deleted';
            current.candidates[idx].recruitmentStage = 'Deleted / Archived';
            current.candidates[idx].deletedAt = new Date().toISOString();
          }
          return current;
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: `Candidate ${targetId} profile archived. Email and mobile number are now released for new registration.`,
          candidates: updatedDb.candidates
        }));
      }

      if (action === 'restore') {
        const updatedDb = await mutateDb((current) => {
          if (!current.candidates) current.candidates = [];
          const idx = current.candidates.findIndex(c =>
            (c.candidateId && c.candidateId.toLowerCase() === cleanTarget) ||
            (c._id && c._id.toLowerCase() === cleanTarget) ||
            (c.email && c.email.toLowerCase() === cleanTarget)
          );
          if (idx >= 0) {
            current.candidates[idx].status = 'Registered';
            current.candidates[idx].recruitmentStage = 'Registered';
            current.candidates[idx].deletedAt = null;
          }
          return current;
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: `Candidate ${targetId} profile successfully restored to Active.`,
          candidates: updatedDb.candidates
        }));
      }

      if (action === 'update_stage' || (payload.stage && targetId)) {
        const stage = payload.stage;
        const updatedDb = await mutateDb((current) => {
          if (!current.candidates) current.candidates = [];
          const idx = current.candidates.findIndex(c =>
            (c.candidateId && c.candidateId.toLowerCase() === cleanTarget) ||
            (c._id && c._id.toLowerCase() === cleanTarget) ||
            (c.email && c.email.toLowerCase() === cleanTarget)
          );
          if (idx >= 0) {
            current.candidates[idx].recruitmentStage = stage;
            current.candidates[idx].updatedAt = new Date().toISOString();
          }
          return current;
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: `Candidate ${targetId} stage updated to ${stage}`,
          candidates: updatedDb.candidates
        }));
      }

      if (action === 'permanent_delete') {
        const updatedDb = await mutateDb((current) => {
          if (!current.candidates) current.candidates = [];
          current.candidates = current.candidates.filter(c =>
            c.candidateId?.toLowerCase() !== cleanTarget &&
            c._id?.toLowerCase() !== cleanTarget &&
            c.email?.toLowerCase() !== cleanTarget
          );
          if (current.assessment_results) {
            current.assessment_results = current.assessment_results.filter(r =>
              r.candidateId?.toLowerCase() !== cleanTarget &&
              r.candidateDisplayId?.toLowerCase() !== cleanTarget
            );
          }
          return current;
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: `Candidate ${targetId} profile permanently removed from system.`,
          candidates: updatedDb.candidates
        }));
      }
    }

    // 3. Upsert or sync candidate(s)
    if (req.method === 'POST') {
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

    // 4. List all registered candidates
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
