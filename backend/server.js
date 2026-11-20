const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { Server } = require('socket.io');
const { PORT, NODE_ENV, ORGANIZATION, PORTAL_NAME } = require('./config/env');
const apiRoutes = require('./routes/api');
const { seedDatabase } = require('./seed/index');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// High-Concurrency Middleware (Optimized for 5,000+ Concurrent Candidates)
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    organization: ORGANIZATION,
    portal: PORTAL_NAME,
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    activeSocketConnections: io.engine.clientsCount
  });
});

// Mount Master API routes
app.use('/api', apiRoutes);

// Serve Frontend Production Build with Browser Cache-Control
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      }
    }
  }));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Socket.IO Proctoring & Real-time Room Handling
io.on('connection', (socket) => {
  socket.on('join_exam_session', ({ sessionId, candidateId }) => {
    socket.join(`session:${sessionId}`);
    socket.join('proctor_room');
    io.to('proctor_room').emit('candidate_online', { sessionId, candidateId, timestamp: new Date().toISOString() });
  });

  socket.on('candidate_heartbeat', (data) => {
    io.to('proctor_room').emit('candidate_status_update', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('violation_alert', (violationData) => {
    io.to('proctor_room').emit('new_violation_incident', {
      ...violationData,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send_proctor_warning', ({ sessionId, message }) => {
    io.to(`session:${sessionId}`).emit('proctor_message', { message, timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

// Initialize Database and Start Server
async function start() {
  try {
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 ${ORGANIZATION}`);
      console.log(`📡 ${PORTAL_NAME} Full-Stack Engine Running`);
      console.log(`🌐 Application URL: http://localhost:${PORT}`);
      console.log(`📡 REST API Base:   http://localhost:${PORT}/api`);
      console.log(`🩺 Health Check:    http://localhost:${PORT}/api/health`);
      console.log(`⚡ WebSocket / Socket.IO Enabled`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start Inzovate Assessment backend:', err);
    process.exit(1);
  }
}

start();
