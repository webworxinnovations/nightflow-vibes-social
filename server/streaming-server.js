// Railway-optimized Node.js streaming server
const express = require('express');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active streams in memory
const activeStreams = new Map();

// RAILWAY CRITICAL: Root endpoint must respond quickly
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Nightflow Streaming Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.6',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  });
});

// RAILWAY CRITICAL: Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeStreams: activeStreams.size,
    uptime: Math.floor(process.uptime()),
    version: '1.0.6',
    port: process.env.PORT || 3000,
    memory: process.memoryUsage()
  });
});

// Stream status endpoint
app.get('/api/stream/:streamKey/status', (req, res) => {
  const { streamKey } = req.params;
  
  const stream = activeStreams.get(streamKey);
  
  if (stream) {
    const duration = Math.floor((Date.now() - stream.startTime) / 1000);
    const status = {
      isLive: true,
      viewerCount: stream.viewerCount || Math.floor(Math.random() * 50) + 1,
      duration,
      bitrate: 2500,
      resolution: '1920x1080',
      timestamp: new Date().toISOString()
    };
    res.status(200).json(status);
  } else {
    const status = {
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: '',
      timestamp: new Date().toISOString()
    };
    res.status(200).json(status);
  }
});

// Stream validation endpoint
app.get('/api/stream/:streamKey/validate', (req, res) => {
  const { streamKey } = req.params;
  
  if (streamKey && streamKey.startsWith('nf_')) {
    res.status(200).json({ 
      valid: true, 
      message: 'Stream key is valid',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({ 
      valid: false, 
      error: 'Invalid stream key format',
      timestamp: new Date().toISOString()
    });
  }
});

// Start stream endpoint
app.post('/api/stream/:streamKey/start', (req, res) => {
  const { streamKey } = req.params;
  
  activeStreams.set(streamKey, {
    streamKey,
    startTime: Date.now(),
    viewerCount: Math.floor(Math.random() * 10) + 1
  });
  
  res.status(200).json({ 
    success: true, 
    message: 'Stream started',
    timestamp: new Date().toISOString()
  });
});

// Stop stream endpoint
app.post('/api/stream/:streamKey/stop', (req, res) => {
  const { streamKey } = req.params;
  
  if (activeStreams.delete(streamKey)) {
    res.status(200).json({ 
      success: true, 
      message: 'Stream stopped',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Stream not found',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// RAILWAY SPECIFIC: Use Railway's PORT
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Nightflow Streaming Server v1.0.6...');
console.log(`📍 PORT: ${PORT}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Start server - Railway handles host binding automatically
const server = app.listen(PORT, () => {
  console.log(`✅ SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🔗 Health: https://nodejs-production-aa37f.up.railway.app/health`);
  console.log(`⚡ Ready to accept connections`);
});

server.on('error', (error) => {
  console.error('❌ SERVER ERROR:', error);
  process.exit(1);
});

// Keep alive ping
setInterval(() => {
  console.log(`💓 Server alive - Port ${PORT} - Uptime: ${Math.floor(process.uptime())}s`);
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received - shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received - shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});
