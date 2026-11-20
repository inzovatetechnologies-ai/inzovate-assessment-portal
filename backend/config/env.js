const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'inzovate-super-secret-enterprise-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  MONGODB_URI: process.env.MONGODB_URI || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ORGANIZATION: 'INZOVATE TECHNOLOGIES PRIVATE LIMITED',
  PORTAL_NAME: 'INZOVATE TALENT ASSESSMENT PORTAL',
  CIN: 'U62011TZ2025PTC036329',
  HOSTINGER_DOMAIN: 'assessment.inzovate-technologies.com',
  S3_STORAGE_BUCKET: process.env.S3_STORAGE_BUCKET || 'inzovate-proctoring-recordings',
  CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID || '',
  DEFAULT_EXAM_DURATION_MINUTES: 45,
  TOTAL_QUESTIONS: 45,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@inzovate-technologies.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@2026',
  TARGET_ADMIN_EMAIL: 'winoraproject@gmail.com',
};
