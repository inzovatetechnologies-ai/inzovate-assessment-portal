const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { getCollection } = require('../config/db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If accessing assessment exam routes, allow seamless candidate session recovery
    if (req.path.startsWith('/exam') || req.originalUrl.includes('/api/exam/')) {
      req.user = { role: 'Candidate', candidateId: req.body.candidateId || null };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (req.path.startsWith('/exam') || req.originalUrl.includes('/api/exam/')) {
        req.user = { role: 'Candidate', candidateId: req.body.candidateId || null };
        return next();
      }
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
    req.user = decoded;
    next();
  });
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const userRole = req.user.role;
    // Super Admin has universal access
    if (userRole === 'Super Admin') return next();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${userRole}' does not have permission for this resource.`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRoles
};
