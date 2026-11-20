const express = require('express');
const cors = require('cors');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const { seedDatabase } = require('./seed/index');

const app = express();

app.set('trust proxy', true);
app.use((req, res, next) => {
  if (!req.socket) req.socket = {};
  if (!req.socket.remoteAddress) req.socket.remoteAddress = '127.0.0.1';
  next();
});

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    organization: 'INZOVATE TECHNOLOGIES PRIVATE LIMITED',
    portal: 'INZOVATE TALENT ASSESSMENT PORTAL',
    timestamp: new Date().toISOString(),
    environment: 'production-serverless',
    mode: 'Vercel Serverless Function'
  });
});

// Seed database on first invocation
let isSeeded = false;
app.use(async (req, res, next) => {
  if (!isSeeded) {
    try {
      await seedDatabase();
      isSeeded = true;
    } catch (e) {
      console.error('Seed error:', e);
    }
  }
  next();
});

// Normalize request URL for Vercel Serverless rewrite routing
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

// Mount routes
app.use('/', apiRoutes);
app.use('/api', apiRoutes);

module.exports = app;
