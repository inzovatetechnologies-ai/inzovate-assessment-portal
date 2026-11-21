import fs from 'fs';
import path from 'path';
import { getDb, mutateDb } from '../api/_data/cloudDb.js';

const BASE_URL = 'https://assessment.inzovate-technologies.com';
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 Inzovate-Audit-Runner/3.0'
};

function loadSeedQuestions() {
  const p = path.join(process.cwd(), 'api', '_data', 'questions.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function runAudit() {
  console.log('========================================================');
  console.log('   INZOVATE V3.0 AUTONOMOUS SYSTEM AUDIT EXECUTION SUITE');
  console.log('========================================================');
  console.log('Target Production URL:', BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  console.log('');

  const results = [];
  function record(id, name, pass, detail) {
    results.push({ id, name, pass, detail });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${name} - ${detail}`);
  }

  // 1. Health Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { headers: HEADERS });
    const json = await res.json();
    const ok = res.status === 200 && json.status === 'ONLINE';
    record('API-01', 'Serverless Health Check', ok, `Status: ${res.status}, Mode: ${json.mode}`);
  } catch (e) {
    record('API-01', 'Serverless Health Check', false, e.message);
  }

  // 2. Colleges Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/colleges`, { headers: HEADERS });
    const json = await res.json();
    const count = json.colleges ? json.colleges.length : (Array.isArray(json) ? json.length : 0);
    const ok = res.status === 200 && count > 5;
    record('API-02', 'Colleges Directory Query', ok, `Count: ${count}`);
  } catch (e) {
    record('API-02', 'Colleges Directory Query', false, e.message);
  }

  // 3. Drives Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/drives`, { headers: HEADERS });
    const json = await res.json();
    const count = json.drives ? json.drives.length : (Array.isArray(json) ? json.length : 0);
    const ok = res.status === 200 && count > 0;
    record('API-03', 'Recruitment Drives Query', ok, `Drives found: ${count}`);
  } catch (e) {
    record('API-03', 'Recruitment Drives Query', false, e.message);
  }

  // 4. Domains & Job Roles
  try {
    const resRoles = await fetch(`${BASE_URL}/api/job-roles`, { headers: HEADERS });
    const jsonRoles = await resRoles.json();
    const rolesList = jsonRoles.roles || (Array.isArray(jsonRoles) ? jsonRoles : []);
    const resDom = await fetch(`${BASE_URL}/api/domains`, { headers: HEADERS });
    const jsonDom = await resDom.json();
    const domList = jsonDom.domains || (Array.isArray(jsonDom) ? jsonDom : []);
    const ok = resRoles.status === 200 && resDom.status === 200 && rolesList.length > 0 && domList.length > 0;
    record('API-04', 'Domains & Job Roles Query', ok, `Roles: ${rolesList.length}, Domains: ${domList.length}`);
  } catch (e) {
    record('API-04', 'Domains & Job Roles Query', false, e.message);
  }

  // 5. Question Bank (Exam Endpoint)
  let qList = [];
  try {
    const res = await fetch(`${BASE_URL}/api/exam?type=questions`, { headers: HEADERS });
    const json = await res.json();
    qList = json.questions || [];
    const ok = res.status === 200 && json.success && qList.length === 330;
    record('API-05', 'Question Bank Total Catalog Feed', ok, `Total Questions: ${qList.length} (330 across 3 sections)`);
  } catch (e) {
    record('API-05', 'Question Bank Total Catalog Feed', false, e.message);
  }

  // 6. Admin Login (Negative & Positive)
  try {
    const negRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ identifier: 'admin@inzovate-technologies.com', password: 'WrongPassword999!' })
    });
    const negJson = await negRes.json();
    const negOk = negRes.status === 401 && !negJson.success;
    record('SEC-01', 'Admin Login Rejection on Bad Credentials', negOk, `Status: ${negRes.status}`);

    const posRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ identifier: 'admin@inzovate-technologies.com', password: 'Admin@2026' })
    });
    const posJson = await posRes.json();
    const posOk = posRes.status === 200 && posJson.success && posJson.token;
    record('SEC-02', 'Admin Gateway Authentication', posOk, `Token: ${posJson.token ? posJson.token.slice(0, 20) + '...' : 'none'}`);
  } catch (e) {
    record('SEC-02', 'Admin Authentication Suite', false, e.message);
  }

  // 7. Candidate Registration (Negative Validation)
  try {
    const negReg = await fetch(`${BASE_URL}/api/candidates/register`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ fullName: 'Incomplete' })
    });
    const negRegJson = await negReg.json();
    const negOk = (negReg.status === 400 || negReg.status === 422) && !negRegJson.success;
    record('VAL-01', 'Candidate Registration Schema Validation', negOk, `Rejected incomplete payload with status ${negReg.status}`);
  } catch (e) {
    record('VAL-01', 'Candidate Registration Schema Validation', false, e.message);
  }

  // 8. Candidate Registration & Pass/Fail Exam Lifecycle
  const ts = Date.now();
  const testCandidatePass = {
    fullName: 'Audit Test Candidate PASS',
    email: `audit.pass.${ts}@inzovate-test.com`,
    mobileNumber: '9876543210',
    collegeName: 'Audit Engineering College',
    degree: 'B.E. Computer Science',
    branch: 'CSE',
    cgpa: '8.8',
    yearOfPassing: '2026',
    jobRoleId: 'role-soft-dev',
    jobRoleTitle: 'Software Developer',
    domainId: 'dom-01',
    domainName: 'Software Development',
    password: 'Password@2026'
  };

  const testCandidateFail = {
    fullName: 'Audit Test Candidate FAIL',
    email: `audit.fail.${ts}@inzovate-test.com`,
    mobileNumber: '9876543211',
    collegeName: 'Audit Engineering College',
    degree: 'B.E. Information Technology',
    branch: 'IT',
    cgpa: '7.5',
    yearOfPassing: '2026',
    jobRoleId: 'role-soft-dev',
    jobRoleTitle: 'Software Developer',
    domainId: 'dom-01',
    domainName: 'Software Development',
    password: 'Password@2026'
  };

  let candPassId = null;
  let candFailId = null;

  try {
    const regPassRes = await fetch(`${BASE_URL}/api/candidates/register`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(testCandidatePass)
    });
    const regPassJson = await regPassRes.json();
    candPassId = regPassJson.candidateId || regPassJson.candidate?.candidateId;
    const regPassOk = (regPassRes.status === 201 || regPassRes.status === 200) && !!candPassId;
    record('CUJ-01', 'Candidate Registration (Pass Candidate)', regPassOk, `Candidate ID: ${candPassId}`);

    const regFailRes = await fetch(`${BASE_URL}/api/candidates/register`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(testCandidateFail)
    });
    const regFailJson = await regFailRes.json();
    candFailId = regFailJson.candidateId || regFailJson.candidate?.candidateId;
    const regFailOk = (regFailRes.status === 201 || regFailRes.status === 200) && !!candFailId;
    record('CUJ-02', 'Candidate Registration (Fail Candidate)', regFailOk, `Candidate ID: ${candFailId}`);
  } catch (e) {
    record('CUJ-01', 'Candidate Registration Suite', false, e.message);
  }

  // 9. Candidate Authentication (Login)
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ email: testCandidatePass.email, password: testCandidatePass.password })
    });
    const loginJson = await loginRes.json();
    const loginOk = loginRes.status === 200 && loginJson.success && loginJson.token;
    record('AUT-01', 'Candidate Session Authentication', loginOk, `Token: ${loginJson.token ? loginJson.token.slice(0, 20) + '...' : 'none'}`);
  } catch (e) {
    record('AUT-01', 'Candidate Session Authentication', false, e.message);
  }

  // 10. Exam Submission & Pass Cutoff Verification (>25 marks = Pass, <=25 marks = Fail)
  try {
    const allQuestions = loadSeedQuestions();

    // Build answers for Candidate PASS (30 correct answers)
    const passAnswers = {};
    for (let i = 0; i < 30 && i < allQuestions.length; i++) {
      passAnswers[allQuestions[i]._id] = allQuestions[i].correctOption;
    }
    for (let i = 30; i < 45 && i < allQuestions.length; i++) {
      passAnswers[allQuestions[i]._id] = 'Z';
    }

    const subPassRes = await fetch(`${BASE_URL}/api/exam?path=submit`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ candidateId: candPassId, answers: passAnswers })
    });
    const subPassJson = await subPassRes.json();
    const scorePass = subPassJson.result?.totalScore;
    const isPassed = subPassJson.result?.isPassed;
    const passDecision = subPassJson.result?.selectionStatus;
    const passOk = subPassRes.status === 200 && scorePass === 30 && isPassed === true && passDecision === 'Selected for Next Round';
    record('EXAM-01', 'Exam Scoring & Cutoff (>25 Marks -> Pass)', passOk, `Score: ${scorePass}/45, isPassed: ${isPassed}, Decision: '${passDecision}'`);

    // Build answers for Candidate FAIL (20 correct answers)
    const failAnswers = {};
    for (let i = 0; i < 20 && i < allQuestions.length; i++) {
      failAnswers[allQuestions[i]._id] = allQuestions[i].correctOption;
    }
    for (let i = 20; i < 45 && i < allQuestions.length; i++) {
      failAnswers[allQuestions[i]._id] = 'Z';
    }

    const subFailRes = await fetch(`${BASE_URL}/api/exam?path=submit`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ candidateId: candFailId, answers: failAnswers })
    });
    const subFailJson = await subFailRes.json();
    const scoreFail = subFailJson.result?.totalScore;
    const isFailed = subFailJson.result?.isPassed === false;
    const failDecision = subFailJson.result?.selectionStatus;
    const failOk = subFailRes.status === 200 && scoreFail === 20 && isFailed && failDecision === 'Rejected';
    record('EXAM-02', 'Exam Scoring & Cutoff (<=25 Marks -> Fail)', failOk, `Score: ${scoreFail}/45, isPassed: ${subFailJson.result?.isPassed}, Decision: '${failDecision}'`);
  } catch (e) {
    record('EXAM-01', 'Exam Scoring & Cutoff Evaluation', false, e.message);
  }

  // 11. Admin Dashboard Candidate Management & Stage Mutation
  try {
    const listRes = await fetch(`${BASE_URL}/api/candidates`, { headers: HEADERS });
    const listJson = await listRes.json();
    const candidates = listJson.candidates || (Array.isArray(listJson) ? listJson : []);
    const foundPass = candidates.find(c => c.candidateId === candPassId);
    const foundFail = candidates.find(c => c.candidateId === candFailId);
    const listOk = listRes.status === 200 && !!foundPass && !!foundFail;
    record('ADM-01', 'Admin Live Candidates Sync', listOk, `Total Candidates: ${candidates.length}, Found Pass: ${!!foundPass}, Found Fail: ${!!foundFail}`);

    // Stage update
    const updateRes = await fetch(`${BASE_URL}/api/candidates?id=${candPassId}&action=update_stage`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ stage: 'Final Selected', notes: 'Top performer in aptitude & technical.' })
    });
    const updateJson = await updateRes.json();
    const updateOk = updateRes.status === 200 && updateJson.success;
    record('ADM-02', 'Admin Recruitment Stage Mutation', updateOk, `Stage updated to 'Final Selected'`);
  } catch (e) {
    record('ADM-01', 'Admin Candidate Operations', false, e.message);
  }

  // 12. Audit Logs & Reports Analytics
  try {
    const auditRes = await fetch(`${BASE_URL}/api/audit-logs`, { headers: HEADERS });
    const auditJson = await auditRes.json();
    const auditLogs = auditJson.logs || (Array.isArray(auditJson) ? auditJson : []);
    const auditOk = auditRes.status === 200 && auditLogs.length > 0;
    record('REP-01', 'System Audit Ledger Retrieval', auditOk, `Audit entries count: ${auditLogs.length}`);

    const repRes = await fetch(`${BASE_URL}/api/reports/analytics`, { headers: HEADERS });
    const repJson = await repRes.json();
    const repOk = repRes.status === 200 && repJson.success;
    record('REP-02', 'Recruitment Analytics & Insights Feed', repOk, `Analytics: totalRegistered=${repJson.metrics?.totalRegistered}, completed=${repJson.metrics?.completedAssessments}`);
  } catch (e) {
    record('REP-01', 'Audit & Reports Analytics', false, e.message);
  }

  // 13. Clean Up Test Records (Rule 9: No persistent test pollution)
  try {
    await mutateDb(draft => {
      draft.candidates = (draft.candidates || []).filter(c => c.candidateId !== candPassId && c.candidateId !== candFailId);
      draft.assessment_results = (draft.assessment_results || []).filter(r => r.candidateId !== candPassId && r.candidateId !== candFailId);
    });
    record('CLN-01', 'Database Test Cleanup (Self-Sanitization)', true, `Purged test records ${candPassId} and ${candFailId}`);
  } catch (e) {
    record('CLN-01', 'Database Test Cleanup', false, e.message);
  }

  console.log('');
  console.log('========================================================');
  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;
  console.log(`AUDIT SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED (${results.length} Total Checks)`);
  console.log('========================================================');
  return { results, passCount, failCount };
}

runAudit().catch(err => {
  console.error('Audit run error:', err);
  process.exit(1);
});
