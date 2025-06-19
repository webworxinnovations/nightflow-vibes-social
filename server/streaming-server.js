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
    version: '1.0.3',
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
    version: '1.0.3'
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

// RAILWAY CRITICAL: Proper port and host configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enhanced startup logging
console.log('🚀 === RAILWAY DEPLOYMENT DEBUG ===');
console.log('📊 Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('🔧 Server Configuration:');
console.log('  Binding HOST:', HOST);
console.log('  Binding PORT:', PORT);
console.log('  PORT type:', typeof PORT);
console.log('🖥️  System Info:');
console.log('  Node.js version:', process.version);
console.log('  Platform:', process.platform);
console.log('  Working directory:', process.cwd());
console.log('=====================================');

// RAILWAY CRITICAL: Server startup with comprehensive error handling
const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  console.log('🎉 === RAILWAY SERVER STARTED ===');
  console.log(`✅ Server successfully bound to: ${addr.address}:${addr.port}`);
  console.log(`🌐 Public URL: https://nodejs-production-aa37f.up.railway.app`);
  console.log(`🔗 Health check: https://nodejs-production-aa37f.up.railway.app/health`);
  console.log(`🚀 Railway load balancer can now reach this server`);
  console.log('===================================');
});

// Enhanced error handling with detailed Railway-specific debugging
server.on('error', (error) => {
  console.error('🚨 === RAILWAY SERVER ERROR ===');
  console.error('Error occurred during server startup');
  console.error('Error details:');
  console.error('  Code:', error.code);
  console.error('  Message:', error.message);
  console.error('  Stack:', error.stack);
  
  // Specific Railway debugging
  console.error('🔍 Railway Environment Check:');
  console.error('  PORT env var:', process.env.PORT);
  console.error('  PORT type:', typeof process.env.PORT);
  console.error('  Attempted bind HOST:', HOST);
  console.error('  Attempted bind PORT:', PORT);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('Railway may be trying to bind to a port that is occupied');
  } else if (error.code === 'EACCES') {
    console.error(`❌ Permission denied for port ${PORT}`);
    console.error('Railway may not have permission to bind to this port');
  } else if (error.code === 'ENOTFOUND') {
    console.error(`❌ Cannot bind to host ${HOST}`);
    console.error('Railway may not be able to resolve the bind address');
  }
  
  console.error('🔧 Suggested fixes:');
  console.error('  1. Check Railway PORT environment variable');
  console.error('  2. Ensure 0.0.0.0 binding');
  console.error('  3. Verify Railway deployment configuration');
  console.error('===============================');
  
  process.exit(1);
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`✅ Railway server listening event fired`);
  console.log(`📍 Confirmed binding: ${addr.address}:${addr.port}`);
  console.log(`🔌 Railway load balancer connection: READY`);
  
  // Test internal health check
  setTimeout(() => {
    console.log('🔍 Testing internal server response...');
  }, 1000);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received - Railway shutdown initiated`);
  server.close(() => {
    console.log('✅ Railway server closed gracefully');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Railway uncaught exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Railway unhandled rejection:', promise, 'reason:', reason);
  process.exit(1);
});

// Enhanced Railway heartbeat with more debugging
setInterval(() => {
  const addr = server.address();
  const memUsage = process.memoryUsage();
  console.log(`💓 Railway heartbeat - Uptime: ${Math.floor(process.uptime())}s - Streams: ${activeStreams.size} - Address: ${addr ? `${addr.address}:${addr.port}` : 'unknown'} - Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
}, 60000);
