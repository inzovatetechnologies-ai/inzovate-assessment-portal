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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
  }

  try {
    const body = await parseBody(req);
    const identifier = String(body.identifier || body.username || body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!identifier || !password) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Admin username/email and password are required.'
      }));
    }

    const isValidAdminPassword =
      password === 'Admin@2026' ||
      password === 'Admin@Inzovate2026' ||
      password === process.env.ADMIN_PASSWORD;

    if (!isValidAdminPassword) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        message: 'Invalid Admin access credentials. Access restricted to authorized personnel only.'
      }));
    }

    const adminUser = {
      id: 'admin-inzovate-01',
      fullName: 'Lead System Administrator',
      email: identifier || 'admin@inzovate-technologies.com',
      role: 'Admin',
      department: 'Talent Acquisition & Assessment Control',
      status: 'active'
    };

    const token = 'inz_admin_jwt_' + Buffer.from(adminUser.email).toString('base64');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: 'Admin authentication granted. Welcome to Admin Command Center.',
      token,
      user: adminUser
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: err.message }));
  }
}
