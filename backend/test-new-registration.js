const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buf) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buf });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buf) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buf });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function verify() {
  console.log('--- TESTING NEW REGISTRATION FLOW & DOMAIN ---');

  // 1. Fetch Domains
  const domRes = await get('/api/domains');
  const procDomain = domRes.data?.domains?.find(d => d.name.toLowerCase().includes('process associate'));
  console.log('1. Process Associate Domain found:', procDomain ? `${procDomain.name} (${procDomain._id})` : 'NO');
  if (!procDomain) throw new Error('Process Associate domain missing');

  // 2. Fetch Job Roles
  const rolesRes = await get('/api/job-roles');
  const procRole = rolesRes.data?.roles?.find(r => r.title.toLowerCase().includes('process associate'));
  console.log('2. Process Associate Role found:', procRole ? `${procRole.title} (${procRole._id})` : 'NO');
  if (!procRole) throw new Error('Process Associate role missing');

  // 3. Register candidate with typed college, no resume, no OTP
  const unique = Math.floor(100000 + Math.random() * 900000);
  const regPayload = {
    fullName: 'Mousik Vignesh',
    email: `mousik.${unique}@gmail.com`,
    mobileNumber: `87780${unique.toString().slice(0, 5)}`,
    password: 'MousikPassword@123',
    confirmPassword: 'MousikPassword@123',
    collegeName: 'Coimbatore Institute of Engineering & Technology', // TYPED COLLEGE NAME
    degree: 'B.Com / B.Tech',
    department: 'Business & Information Systems',
    cgpa: '8.4',
    fatherName: 'Vigneshwaran',
    fatherMobile: '9842100000',
    domainId: procDomain._id,
    jobRoleId: procRole._id,
    termsAccepted: true,
    webcamConsent: true,
    candidateDeclaration: true,
  };

  console.log('3. Registering with typed college:', regPayload.collegeName);
  const regRes = await post('/api/candidates/register', regPayload);
  console.log('Registration response status:', regRes.status, 'Candidate ID:', regRes.data?.candidateId);
  if (!regRes.data?.success) throw new Error('Registration failed: ' + regRes.data?.message);

  const candidateId = regRes.data.candidateId;

  // 4. Login with candidateId
  console.log('4. Logging in with Candidate ID:', candidateId);
  const loginRes = await post('/api/auth/login', {
    identifier: candidateId,
    password: 'MousikPassword@123',
  });
  console.log('Login status:', loginRes.status, 'Candidate:', loginRes.data?.user?.fullName);
  if (!loginRes.data?.success) throw new Error('Login failed');

  const token = loginRes.data.token;

  // 5. Start Exam
  console.log('5. Starting Exam Session for Process Associate...');
  const examRes = await post('/api/exam/start', { candidateId }, { Authorization: `Bearer ${token}` });
  console.log('Exam start status:', examRes.status, 'Session ID:', examRes.data?.session?.sessionId);
  console.log('Questions received:', examRes.data?.session?.totalQuestions);
  console.log('Candidate meta:', examRes.data?.session?.candidate);
  if (examRes.data?.session?.totalQuestions !== 45) {
    throw new Error('Expected 45 questions, got ' + examRes.data?.session?.totalQuestions);
  }

  // 6. Verify typed college name persisted correctly
  if (examRes.data?.session?.candidate?.collegeName !== 'Coimbatore Institute of Engineering & Technology') {
    throw new Error('Typed college name not persisted: ' + examRes.data?.session?.candidate?.collegeName);
  }

  console.log('✓ VERIFIED: College name typed by candidate is 100% saved and loaded.');
  console.log('✓ VERIFIED: Process Associate domain and role successfully allocated.');
  console.log('✓ VERIFIED: 45 questions loaded.');
  console.log('🎉 ALL CHECKS PASSED PERFECTLY!');
}

verify().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
