import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb, saveExamResultToDb } from './_data/cloudDb.js';
import { getRoleTitleById, getDomainNameById, getDomainByRoleId } from './_data/rolesData.js';

function loadAllQuestions() {
  const seedPaths = [
    path.join(process.cwd(), 'api', '_data', 'questions.json'),
    path.join(process.cwd(), 'frontend', 'api', '_data', 'questions.json'),
    path.join(process.cwd(), 'backend', 'data', 'questions.json'),
    path.join(process.cwd(), '_data', 'questions.json'),
  ];
  for (const sp of seedPaths) {
    if (fs.existsSync(sp)) {
      try {
        const data = JSON.parse(fs.readFileSync(sp, 'utf8'));
        if (Array.isArray(data) && data.length > 0) return data;
      } catch (e) {}
    }
  }
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

function sanitizeQuestion(q) {
  return {
    _id: q._id,
    section: q.section,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options ? q.options.map(o => ({ id: o.id, text: o.text })) : [],
    marks: q.marks || 1,
  };
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
  const pathParam = url.searchParams.get('path') || '';
  const typeParam = url.searchParams.get('type') || '';
  const actionParam = url.searchParams.get('action') || '';
  const rawPath = url.pathname.replace(/^\/api\//, '');

  const effectiveRoute = pathParam || typeParam || actionParam || rawPath;

  // 1. Question Bank Query
  if (effectiveRoute.includes('question') || typeParam === 'questions') {
    const allQ = loadAllQuestions();
    const sanitized = allQ.map(sanitizeQuestion);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, count: sanitized.length, questions: sanitized }));
  }

  // 2. Live Proctoring Sessions
  if (effectiveRoute.includes('proctoring')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, liveSessions: [] }));
  }

  // 3. Exam Result by candidateId
  if (effectiveRoute.includes('result') || effectiveRoute.startsWith('results/')) {
    let candidateId = url.searchParams.get('candidateId');
    if (!candidateId) {
      const parts = effectiveRoute.split('/');
      candidateId = parts[parts.length - 1];
    }
    if (!candidateId || candidateId === 'result' || candidateId === 'results') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, message: 'Candidate ID is required to retrieve submission status.' }));
    }

    const cleanId = String(candidateId).toLowerCase().trim();
    const db = await getDb(false);
    const results = db.assessment_results || [];
    const found = results.find(r =>
      (r.candidateId && r.candidateId.toLowerCase().trim() === cleanId) ||
      (r.candidateDisplayId && r.candidateDisplayId.toLowerCase().trim() === cleanId)
    );
    if (found) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, result: found }));
    }

    const candidate = (db.candidates || []).find(c =>
      (c.candidateId && c.candidateId.toLowerCase().trim() === cleanId) ||
      (c.email && c.email.toLowerCase().trim() === cleanId)
    );
    if (candidate && candidate.assessmentResult) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, result: candidate.assessmentResult }));
    }

    if (candidate && candidate.assessmentStatus === 'Completed') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        result: {
          candidateId: candidate.candidateId,
          candidateDisplayId: candidate.candidateId,
          candidateName: candidate.fullName,
          jobRoleTitle: candidate.jobRoleTitle || 'Software Developer',
          domainName: candidate.domainName || 'Software Development',
          collegeName: candidate.collegeName,
          status: 'Completed',
          completedAt: candidate.completedAt || new Date().toISOString()
        }
      }));
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Assessment submission record not found for this candidate.' }));
  }

  // 4. Reset Attempt (Strictly Disabled — One-Time Assessment Policy)
  if (effectiveRoute.includes('reset-attempt')) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'Re-attempting the assessment is strictly disabled. One-time assessment policy applies.'
    }));
  }

  // 5. Save Answer Heartbeat
  if (effectiveRoute.includes('save-answer')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, message: 'Answer saved' }));
  }

  // 6. Log Proctoring Violation
  if (effectiveRoute.includes('violation')) {
    const payload = await parseBody(req);
    const currentCount = Number(payload.currentCount || 0) + 1;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      violationLogged: true,
      violationCount: currentCount,
      message: payload.details || 'Proctoring violation recorded.'
    }));
  }

  // 7. Terminate Session
  if (effectiveRoute.includes('terminate-session')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true }));
  }

function findAuthoritativeCandidate(candidates, candidateId, candidateEmail) {
  const cleanId = String(candidateId || '').toLowerCase().trim();
  const cleanEmail = String(candidateEmail || '').toLowerCase().trim();
  const list = candidates || [];

  // 1. Strict candidateId / _id match first (prevents matching an older record with the same email)
  if (cleanId) {
    const byId = list.find(c =>
      (c.candidateId && c.candidateId.toLowerCase().trim() === cleanId) ||
      (c._id && c._id.toLowerCase().trim() === cleanId)
    );
    if (byId) return byId;
  }

  // 2. Fallback to email only if no candidateId match (pick latest matching record)
  const targetEmail = cleanEmail || (cleanId.includes('@') ? cleanId : '');
  if (targetEmail) {
    for (let i = list.length - 1; i >= 0; i--) {
      const c = list[i];
      if (c.status !== 'deleted' && c.email && c.email.toLowerCase().trim() === targetEmail) {
        return c;
      }
    }
  }
  return null;
}

  // 8. Submit Assessment
  if (effectiveRoute.includes('submit')) {
    const payload = await parseBody(req);
    const candidateId = payload.candidateId;
    const candidateEmail = payload.candidateEmail || payload.email || '';

    if (!candidateId && !candidateEmail) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Candidate identification is missing. Please sign in again before submitting.'
      }));
    }

    const allQuestions = loadAllQuestions();
    const questionMap = new Map();
    allQuestions.forEach(q => questionMap.set(q._id, q));

    let db = await getDb(false);
    let candidate = findAuthoritativeCandidate(db.candidates, candidateId, candidateEmail);
    if (!candidate) {
      db = await getDb(true);
      candidate = findAuthoritativeCandidate(db.candidates, candidateId, candidateEmail) || {};
    }

    if (candidate.assessmentStatus === 'Completed' || candidate.assessmentStatus === 'Terminated') {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        alreadyCompleted: true,
        message: 'Already you completed the assessment. Multiple submissions are not allowed.',
        result: candidate.assessmentResult || null
      }));
    }

    const answers = payload.answers || {};

    let aptScore = 0;
    let commScore = 0;
    let techScore = 0;
    let totalAttempted = 0;

    for (const [qId, ansVal] of Object.entries(answers)) {
      const selected = typeof ansVal === 'object' && ansVal !== null ? ansVal.selectedOption : ansVal;
      if (selected !== undefined && selected !== null && String(selected).trim() !== '') {
        totalAttempted++;
        const q = questionMap.get(qId);
        if (q && q.correctOption && String(selected).trim() === String(q.correctOption).trim()) {
          if (q.section === 'section-1') aptScore++;
          else if (q.section === 'section-2') commScore++;
          else techScore++;
        }
      }
    }

    const totalScore = aptScore + commScore + techScore;
    const percentage = Math.round((totalScore / 45) * 100);
    const isPassed = totalScore > 25;
    const examResult = isPassed ? 'Pass' : 'Fail';
    const selectionStatus = isPassed ? 'Selected for Next Round' : 'Rejected';

    let performanceCategory = 'Needs Improvement';
    if (percentage >= 80) performanceCategory = 'Mastery (Outstanding)';
    else if (percentage >= 65) performanceCategory = 'Proficient (Commendable)';
    else if (percentage >= 50) performanceCategory = 'Foundational (Competent)';

    const certificateId = 'INZ-CERT-2026-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const resolvedRoleTitle =
      candidate.jobRoleTitle ||
      payload.jobRoleTitle ||
      getRoleTitleById(candidate.jobRoleId || payload.jobRoleId) ||
      'Software Developer';

    const resolvedDomainName =
      candidate.domainName ||
      payload.domainName ||
      getDomainNameById(candidate.domainId || payload.domainId) ||
      getDomainByRoleId(candidate.jobRoleId || payload.jobRoleId) ||
      'Software Development';

    const result = {
      sessionId: payload.sessionId || 'session-' + Date.now(),
      candidateId: candidate.candidateId || candidateId,
      candidateDisplayId: candidate.candidateId || candidateId,
      candidateName: candidate.fullName || payload.candidateName || 'Candidate',
      candidateEmail: candidate.email || candidateEmail || '',
      jobRoleId: candidate.jobRoleId || payload.jobRoleId || 'role-soft-dev',
      jobRoleTitle: resolvedRoleTitle,
      domainId: candidate.domainId || payload.domainId || 'dom-01',
      domainName: resolvedDomainName,
      collegeName: candidate.collegeName || payload.collegeName || 'Autonomous Engineering College',
      totalScore,
      maxScore: 45,
      totalQuestions: 45,
      totalAttempted,
      totalQuestionsAttempted: totalAttempted,
      unattempted: Math.max(0, 45 - totalAttempted),
      percentage,
      isPassed,
      examResult,
      selectionStatus,
      passCutoff: '> 25',
      performanceCategory,
      status: String(payload.submissionType || '').startsWith('Terminated') ? 'Terminated' : 'Completed',
      submissionType: payload.submissionType || 'manual',
      certificateId,
      sectionScores: {
        'section-1': { score: aptScore, total: 15, percentage: Math.round((aptScore / 15) * 100) },
        'section-2': { score: commScore, total: 15, percentage: Math.round((commScore / 15) * 100) },
        'section-3': { score: techScore, total: 15, percentage: Math.round((techScore / 15) * 100) }
      },
      completedAt: new Date().toISOString()
    };

    // Save permanently to CloudDB attached to candidate
    await saveExamResultToDb(result.candidateId, result);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, result }));
  }

  // 9. Start Assessment Session
  try {
    const payload = await parseBody(req);
    const candidateId = payload.candidateId;
    const candidateEmail = payload.candidateEmail || payload.email || '';

    if (!candidateId && !candidateEmail) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Candidate session expired or missing. Please log in with your Candidate ID or Email.'
      }));
    }

    let db = await getDb(false);
    let matchedCandidate = findAuthoritativeCandidate(db.candidates, candidateId, candidateEmail);
    if (!matchedCandidate) {
      db = await getDb(true);
      matchedCandidate = findAuthoritativeCandidate(db.candidates, candidateId, candidateEmail);
    }

    const cleanEmail = String(candidateEmail || matchedCandidate?.email || '').toLowerCase().trim();
    const cleanMobileDigits = String(payload.mobileNumber || matchedCandidate?.mobileNumber || '').replace(/\D/g, '').slice(-10);
    const completedDuplicate = (db.candidates || []).find(c =>
      c.status !== 'deleted' &&
      (c.assessmentStatus === 'Completed' || c.assessmentStatus === 'Terminated') && (
        (matchedCandidate && c.candidateId === matchedCandidate.candidateId) ||
        (cleanEmail && c.email && c.email.toLowerCase().trim() === cleanEmail) ||
        (cleanMobileDigits.length >= 10 && c.mobileNumber && c.mobileNumber.replace(/\D/g, '').endsWith(cleanMobileDigits))
      )
    );

    if (completedDuplicate) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        isCompleted: true,
        message: 'Already you completed the assessment. Only one attempt per Email and Mobile Number is allowed.',
        candidate: {
          id: completedDuplicate.candidateId,
          fullName: completedDuplicate.fullName,
          email: completedDuplicate.email,
          jobRoleId: completedDuplicate.jobRoleId,
          jobRoleTitle: completedDuplicate.jobRoleTitle,
          domainId: completedDuplicate.domainId,
          domainName: completedDuplicate.domainName
        }
      }));
    }

    const allQuestions = loadAllQuestions();
    const targetRoleId = matchedCandidate?.jobRoleId || payload.jobRoleId || 'role-soft-dev';

    const section1 = allQuestions.filter(q => q.section === 'section-1').slice(0, 15);
    const section2 = allQuestions.filter(q => q.section === 'section-2').slice(0, 15);
    const roleSection3 = allQuestions.filter(q => q.section === 'section-3' && q.roleId === targetRoleId);
    const section3 = (
      roleSection3.length >= 15
        ? roleSection3
        : [...roleSection3, ...allQuestions.filter(q => q.section === 'section-3' && q.roleId !== targetRoleId)]
    ).slice(0, 15);

    const questions45 = [...section1, ...section2, ...section3];

    while (questions45.length < 45 && allQuestions.length > 0) {
      questions45.push({ ...allQuestions[questions45.length % allQuestions.length], _id: 'gen-q-' + questions45.length });
    }

    const sanitizedQuestions = questions45.map(sanitizeQuestion);
    const sessionId = 'inz_cbt_' + crypto.randomUUID();
    const resolvedCandidateId = matchedCandidate?.candidateId || candidateId;

    const sessionObj = {
      sessionId,
      candidateId: resolvedCandidateId,
      candidate: matchedCandidate ? {
        id: matchedCandidate.candidateId,
        fullName: matchedCandidate.fullName,
        email: matchedCandidate.email,
        jobRoleId: matchedCandidate.jobRoleId,
        jobRoleTitle: matchedCandidate.jobRoleTitle,
        domainId: matchedCandidate.domainId,
        domainName: matchedCandidate.domainName,
        collegeName: matchedCandidate.collegeName
      } : null,
      status: 'IN_PROGRESS',
      durationMinutes: 45,
      timeRemainingSeconds: 2700,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
      answers: {},
      violations: [],
      startedAt: new Date().toISOString()
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      sessionId,
      timeRemainingSeconds: 2700,
      durationMinutes: 45,
      session: sessionObj,
      questions: sanitizedQuestions
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
