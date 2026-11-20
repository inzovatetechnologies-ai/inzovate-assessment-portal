const express = require('express');
const cors = require('cors');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const { seedDatabase } = require('./seed/index');

const app = express();

app.set('trust proxy', true);
app.use((req, res, next) => {
  try {
    if (!req.socket) {
      Object.defineProperty(req, 'socket', {
        value: { remoteAddress: '127.0.0.1' },
        configurable: true,
        writable: true,
      });
    } else if (!req.socket.remoteAddress) {
      try {
        req.socket.remoteAddress = '127.0.0.1';
      } catch (e) {}
    }
  } catch (e) {}
  next();
});

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get(['/', '/api', '/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    organization: 'INZOVATE TECHNOLOGIES PRIVATE LIMITED',
    portal: 'INZOVATE TALENT ASSESSMENT PORTAL',
    timestamp: new Date().toISOString(),
    environment: 'production-serverless',
    mode: 'Vercel Serverless Function',
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
  if (req.query && req.query.path) {
    const subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    req.url = '/' + subpath;
  } else if (req.url && req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

// Mount routes
app.use('/', apiRoutes);
app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Express Unhandled Error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'EXPRESS_SERVER_ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  }
});

const handler = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Serverless Handler Invocation Error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVERLESS_HANDLER_EXCEPTION',
          message: err.message,
          stack: err.stack,
        })
      );
    }
  }
};

module.exports = handler;
module.exports.default = handler;
