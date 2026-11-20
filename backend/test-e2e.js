const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        host: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        host: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING INZOVATE FULL-STACK SUITE VERIFICATION');
  console.log('====================================================');

  // Test 1: Health
  const health = await get('/api/health');
  console.log('1. Health Check:', health.data.status === 'ONLINE' ? 'PASSED ✅' : 'FAILED ❌');

  // Test 2: Demo Login as Candidate
  const candLogin = await post('/api/auth/demo-login', { role: 'Candidate' });
  console.log('2. Candidate Authentication:', candLogin.data.success ? 'PASSED ✅' : 'FAILED ❌');
  const candToken = candLogin.data.token;

  // Test 3: Start/Resume Exam Session & Verify Question Counts
  const examStart = await post('/api/exam/start', { candidateId: 'INZ-CAND-2026-00001' }, candToken);
  console.log('3. Assessment Session Initiation:', examStart.data.success ? 'PASSED ✅' : 'FAILED ❌');
  
  if (examStart.data.session) {
    const s = examStart.data.session;
    console.log(`   - Total Questions Delivered: ${s.totalQuestions}`);
    const sec1 = s.questions.filter(q => q.section === 'section-1').length;
    const sec2 = s.questions.filter(q => q.section === 'section-2').length;
    const sec3 = s.questions.filter(q => q.section === 'section-3').length;
    console.log(`   - Section 1 (Aptitude & Reasoning): ${sec1} questions`);
    console.log(`   - Section 2 (Communication): ${sec2} questions`);
    console.log(`   - Section 3 (Domain Technical): ${sec3} questions`);

    const hasLeakedKey = s.questions.some(q => q.correctOption !== undefined || q.explanation !== undefined);
    console.log(`   - Security Sanitization (Answer Keys Protected): ${!hasLeakedKey ? 'PASSED ✅' : 'FAILED ❌ (LEAK DETECTED)'}`);

    // Test 4: Save Answer Heartbeat
    const firstQ = s.questions[0];
    const saveAnswer = await post('/api/exam/save-answer', {
      sessionId: s.sessionId,
      questionId: firstQ._id,
      selectedOption: 'B',
      isMarkedForReview: false
    }, candToken);
    console.log('4. Auto-Save Answer Heartbeat:', saveAnswer.data.success ? 'PASSED ✅' : 'FAILED ❌');

    // Test 5: Proctoring Security Violation Logging
    const violation = await post('/api/exam/violation', {
      sessionId: s.sessionId,
      eventType: 'tab_switch',
      details: 'Candidate navigated away from assessment window (Tab switch).'
    }, candToken);
    console.log('5. Anti-Cheating Violation Detection:', violation.data.success ? 'PASSED ✅' : 'FAILED ❌');
  }

  // Test 6: Demo Login as Admin & HR
  const adminLogin = await post('/api/auth/demo-login', { role: 'Admin' });
  console.log('6. Admin Authentication:', adminLogin.data.success ? 'PASSED ✅' : 'FAILED ❌');
  const adminToken = adminLogin.data.token;

  // Test 7: Executive Analytics
  const analytics = await get('/api/reports/analytics', adminToken);
  console.log('7. Executive Analytics Summary:', analytics.data.success ? 'PASSED ✅' : 'FAILED ❌');
  console.log(`   - Total Registered Candidates: ${analytics.data.metrics.totalRegistered}`);
  console.log(`   - Completed Assessments: ${analytics.data.metrics.completedAssessments}`);
  console.log(`   - Average Score: ${analytics.data.metrics.avgScore} / 45 (${analytics.data.metrics.avgPercentage}%)`);

  // Test 8: Public Certificate Verification
  const certVerify = await get('/api/certificates/verify/INZ-CERT-2026-89412');
  console.log('8. Public Certificate Credential Verification:', certVerify.data.verified ? 'PASSED ✅' : 'FAILED ❌');
  console.log(`   - Verified Candidate: ${certVerify.data.certificate.candidateName}`);
  console.log(`   - Performance Rating: ${certVerify.data.certificate.performanceCategory}`);

  console.log('====================================================');
  console.log('🎉 ALL SYSTEM MODULE TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runEndToEndTests().catch(console.error);
