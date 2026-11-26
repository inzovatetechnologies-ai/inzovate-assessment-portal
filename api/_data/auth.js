import crypto from 'crypto';

// Deterministic server-side secret derived from environment or server-only key
// (Never exposed to frontend or client bundles)
const SERVER_SECRET =
  process.env.JWT_SECRET ||
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update('Inzovate-Portal-2026-HMAC-Master-Key-v2').digest('hex');

const ALLOWED_ORIGINS = [
  'https://assessment.inzovate-technologies.com',
  'https://inzovate-assessment-portal.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

export function setSecurityHeaders(req, res, methods = 'GET,POST,OPTIONS') {
  const origin = req.headers?.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://assessment.inzovate-technologies.com');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function signJwt(payload, expiresInSeconds = 12 * 3600) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  }));
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', SERVER_SECRET).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  if (!header || !body || !sig) return null;

  const expectedSig = base64UrlEncode(
    crypto.createHmac('sha256', SERVER_SECRET).update(`${header}.${body}`).digest()
  );

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(body));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && now > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function extractBearerToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization || '';
  if (typeof auth !== 'string') return null;
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

export function authenticateRequest(req) {
  const token = extractBearerToken(req);
  if (!token) return null;
  return verifyJwt(token);
}

export function requireAuth(req, res) {
  const user = authenticateRequest(req);
  if (!user) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Unauthorized: Valid authentication token is required.'
    }));
    return null;
  }
  return user;
}

export function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (String(user.role || '').toLowerCase() !== 'admin') {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'Forbidden: Administrator authorization is required for this resource.'
    }));
    return null;
  }
  return user;
}

export function sanitizeCandidate(c) {
  if (!c || typeof c !== 'object') return c;
  const { password, resetOtp, ...safe } = c;
  return safe;
}
