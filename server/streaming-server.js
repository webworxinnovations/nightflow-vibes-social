// Minimal Node.js streaming server for Railway deployment
const express = require('express');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration for production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Port: ${process.env.PORT}`);
  next();
});

// Store active streams in memory
const activeStreams = new Map();

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).json({ 
    message: 'Nightflow Streaming Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 'not set',
    url: `https://nodejs-production-aa37f.up.railway.app`
  });
});

// Health check endpoint - CRITICAL for Railway
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeStreams: activeStreams.size,
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    env: 'railway',
    port: process.env.PORT || 'not set',
    version: '1.0.0'
  });
});

// Stream status endpoint
app.get('/api/stream/:streamKey/status', (req, res) => {
  const { streamKey } = req.params;
  console.log(`Stream status check for: ${streamKey}`);
  
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
    console.log(`Stream ${streamKey} is live:`, status);
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
    console.log(`Stream ${streamKey} is offline`);
    res.status(200).json(status);
  }
});

// Stream validation endpoint
app.get('/api/stream/:streamKey/validate', (req, res) => {
  const { streamKey } = req.params;
  console.log(`Stream validation for: ${streamKey}`);
  
  // Accept any key that starts with 'nf_'
  if (streamKey && streamKey.startsWith('nf_')) {
    console.log(`Stream key ${streamKey} is valid`);
    res.status(200).json({ 
      valid: true, 
      message: 'Stream key is valid',
      timestamp: new Date().toISOString()
    });
  } else {
    console.log(`Stream key ${streamKey} is invalid`);
    res.status(400).json({ 
      valid: false, 
      error: 'Invalid stream key format',
      timestamp: new Date().toISOString()
    });
  }
});

// Start stream endpoint (for testing)
app.post('/api/stream/:streamKey/start', (req, res) => {
  const { streamKey } = req.params;
  console.log(`Starting stream: ${streamKey}`);
  
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
  console.log(`Stopping stream: ${streamKey}`);
  
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

// Test endpoint for debugging
app.get('/test', (req, res) => {
  console.log('Test endpoint hit - Environment check:');
  console.log('PORT:', process.env.PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  res.status(200).json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 'not set',
    environment: process.env.NODE_ENV || 'not set',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('PORT') || key.includes('NODE'))
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// CRITICAL FIX: Use Railway's PORT environment variable
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Important for Railway

console.log('=== STARTING SERVER ===');
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);
console.log('Using HOST:', HOST);

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Nightflow Streaming Server SUCCESSFULLY started!`);
  console.log(`📍 Server running on ${HOST}:${PORT}`);
  console.log(`🌐 External URL: https://nodejs-production-aa37f.up.railway.app`);
  console.log(`📊 Health check: https://nodejs-production-aa37f.up.railway.app/health`);
  console.log(`🔧 Test endpoint: https://nodejs-production-aa37f.up.railway.app/test`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Enhanced error handling for server startup
server.on('error', (error) => {
  console.error('❌ SERVER STARTUP ERROR:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Keep alive ping
setInterval(() => {
  console.log(`✅ Server alive - Uptime: ${Math.floor(process.uptime())}s - Active streams: ${activeStreams.size} - Port: ${PORT}`);
}, 60000); // Every minute
