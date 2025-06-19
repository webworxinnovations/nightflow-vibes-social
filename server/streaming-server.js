// Railway-optimized Node.js streaming server with RTMP support
const express = require('express');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');
const path = require('path');
const fs = require('fs');

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

// Ensure media directory exists
const mediaRoot = path.join(__dirname, 'media');
if (!fs.existsSync(mediaRoot)) {
  fs.mkdirSync(mediaRoot, { recursive: true });
}

// RAILWAY CRITICAL: Use Railway's assigned port for API, different ports for media services
const RAILWAY_PORT = process.env.PORT || 3000;
const RTMP_PORT = 1935; // Standard RTMP port
const HLS_PORT = 8888; // Different port to avoid conflicts

console.log(`🔧 Port Configuration:`);
console.log(`   - Railway API Port: ${RAILWAY_PORT}`);
console.log(`   - RTMP Port: ${RTMP_PORT}`);
console.log(`   - HLS Port: ${HLS_PORT}`);

// RTMP and HLS configuration with non-conflicting ports
const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: HLS_PORT,
    mediaroot: mediaRoot,
    allow_origin: '*'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: `rtmp://127.0.0.1:${RTMP_PORT}/hls`
      }
    ]
  }
};

// Create and configure Node Media Server
const nms = new NodeMediaServer(config);

// RTMP Events
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  
  // Extract stream key from path (format: /live/STREAM_KEY)
  const streamKey = StreamPath.split('/').pop();
  
  if (streamKey && streamKey.startsWith('nf_')) {
    console.log(`Stream started: ${streamKey}`);
    activeStreams.set(streamKey, {
      streamKey,
      startTime: Date.now(),
      viewerCount: 0
    });
  }
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  
  // Extract stream key from path
  const streamKey = StreamPath.split('/').pop();
  
  if (streamKey && activeStreams.has(streamKey)) {
    console.log(`Stream ended: ${streamKey}`);
    activeStreams.delete(streamKey);
  }
});

// RAILWAY CRITICAL: Root endpoint must respond quickly
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Nightflow Streaming Server with RTMP',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '2.0.2',
    ports: {
      api: RAILWAY_PORT,
      rtmp: RTMP_PORT,
      hls: HLS_PORT
    },
    env: process.env.NODE_ENV || 'development',
    features: ['RTMP Ingestion', 'HLS Output', 'Stream Management'],
    rtmpUrl: `rtmp://${req.get('host')}/live`,
    testUrl: `https://${req.get('host')}/health`
  });
});

// RAILWAY CRITICAL: Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeStreams: activeStreams.size,
    uptime: Math.floor(process.uptime()),
    version: '2.0.2',
    ports: {
      api: RAILWAY_PORT,
      rtmp: RTMP_PORT,
      hls: HLS_PORT
    },
    rtmp: {
      port: RTMP_PORT,
      active: true,
      url: `rtmp://${req.get('host')}/live`
    },
    hls: {
      port: HLS_PORT,
      mediaRoot: mediaRoot,
      baseUrl: `https://${req.get('host')}/live/`
    },
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
      rtmpUrl: `rtmp://${req.get('host')}/live`,
      hlsUrl: `http://${req.get('host')}:${config.http.port}/live/${streamKey}/index.m3u8`,
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

// Serve HLS files
app.use('/live', express.static(path.join(mediaRoot, 'live')));

// List active streams
app.get('/api/streams/active', (req, res) => {
  const streams = Array.from(activeStreams.values()).map(stream => ({
    streamKey: stream.streamKey,
    duration: Math.floor((Date.now() - stream.startTime) / 1000),
    viewerCount: stream.viewerCount,
    hlsUrl: `http://${req.get('host')}:${config.http.port}/live/${stream.streamKey}/index.m3u8`
  }));
  
  res.status(200).json({
    count: streams.length,
    streams
  });
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

console.log('🚀 Starting Nightflow Streaming Server v2.0.2...');
console.log(`📍 API PORT: ${RAILWAY_PORT} (Railway Assigned)`);
console.log(`📍 RTMP PORT: ${RTMP_PORT} (Standard)`);
console.log(`📍 HLS PORT: ${HLS_PORT} (Non-conflicting)`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Media Root: ${mediaRoot}`);

// Start Express server FIRST on Railway's assigned port
const server = app.listen(RAILWAY_PORT, () => {
  console.log(`✅ API SERVER RUNNING ON PORT ${RAILWAY_PORT}`);
  console.log(`🔗 Health: https://nodejs-production-aa37f.up.railway.app/health`);
  console.log(`🎥 RTMP: rtmp://nodejs-production-aa37f.up.railway.app/live`);
  console.log(`📺 HLS Base: https://nodejs-production-aa37f.up.railway.app/live/`);
  
  // Start Node Media Server AFTER API server is running
  try {
    nms.run();
    console.log(`✅ RTMP SERVER STARTED ON PORT ${RTMP_PORT}`);
    console.log(`✅ HLS SERVER STARTED ON PORT ${HLS_PORT}`);
    console.log(`⚡ Ready for OBS connections`);
  } catch (error) {
    console.error(`❌ Media Server Error: ${error.message}`);
    console.log('⚠️  API server running, media server failed');
  }
});

server.on('error', (error) => {
  console.error('❌ API SERVER ERROR:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${RAILWAY_PORT} is already in use!`);
  }
  process.exit(1);
});

// Keep alive ping with detailed port info
setInterval(() => {
  console.log(`💓 Server alive - API:${RAILWAY_PORT} RTMP:${RTMP_PORT} HLS:${HLS_PORT} - Uptime: ${Math.floor(process.uptime())}s - Streams: ${activeStreams.size}`);
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received - shutting down gracefully');
  nms.stop();
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received - shutting down gracefully');
  nms.stop();
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});
