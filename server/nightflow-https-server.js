#!/usr/bin/env node

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');

console.log('🚀 Starting NightFlow HTTPS Streaming Server');
console.log('📍 Droplet IP: 67.205.179.77');

const app = express();

// SSL Configuration
const SSL_CERT_PATH = '/etc/ssl/certs/server.crt';
const SSL_KEY_PATH = '/etc/ssl/private/server.key';
const HTTPS_PORT = 3443;
const RTMP_PORT = 1935;
const MEDIA_ROOT = '/tmp/media';

// Create media directory
if (!fs.existsSync(MEDIA_ROOT)) {
  fs.mkdirSync(MEDIA_ROOT, { recursive: true });
  console.log(`📁 Created media directory: ${MEDIA_ROOT}`);
}

// CORS Configuration - Allow Lovable and other HTTPS origins
app.use(cors({
  origin: [
    'https://22ebeed8-97b2-4ac0-ab35-1b90816024e0.lovableproject.com',
    'https://lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Static file serving for HLS content over HTTPS
app.use('/live', express.static(path.join(MEDIA_ROOT, 'live'), {
  setHeaders: (res, path) => {
    // Set CORS headers for HLS files
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Range, Accept, Content-Type');
    
    // Set appropriate content types for HLS
    if (path.endsWith('.m3u8')) {
      res.set('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (path.endsWith('.ts')) {
      res.set('Content-Type', 'video/mp2t');
    }
  }
}));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'NightFlow HTTPS Streaming Server',
    ssl: 'enabled',
    rtmp: `rtmp://67.205.179.77:${RTMP_PORT}/live`,
    hls: `https://67.205.179.77:${HTTPS_PORT}/live`
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    api: 'functional',
    timestamp: new Date().toISOString(),
    streaming: 'https-enabled'
  });
});

// Stream validation endpoint
app.get('/api/validate/:streamKey', (req, res) => {
  const streamKey = req.params.streamKey;
  const hlsPath = path.join(MEDIA_ROOT, 'live', streamKey, 'index.m3u8');
  
  if (fs.existsSync(hlsPath)) {
    res.json({ valid: true, streamKey, status: 'live' });
  } else {
    res.status(404).json({ valid: false, streamKey, status: 'offline' });
  }
});

// Stream status endpoint
app.get('/api/streams/:streamKey/status', (req, res) => {
  const streamKey = req.params.streamKey;
  const hlsPath = path.join(MEDIA_ROOT, 'live', streamKey, 'index.m3u8');
  
  const isLive = fs.existsSync(hlsPath);
  
  res.json({
    streamKey,
    isLive,
    status: isLive ? 'live' : 'offline',
    hlsUrl: `https://67.205.179.77:${HTTPS_PORT}/live/${streamKey}/index.m3u8`,
    rtmpUrl: `rtmp://67.205.179.77:${RTMP_PORT}/live`,
    timestamp: new Date().toISOString()
  });
});

// Node Media Server Configuration for RTMP
const nmsConfig = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    listen: '0.0.0.0'
  },
  http: {
    port: 9001,
    mediaroot: MEDIA_ROOT,
    allow_origin: '*',
    listen: '127.0.0.1'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: `rtmp://127.0.0.1:${RTMP_PORT}/live`
      }
    ]
  }
};

// Check for SSL certificates
if (!fs.existsSync(SSL_CERT_PATH) || !fs.existsSync(SSL_KEY_PATH)) {
  console.error('❌ SSL certificates not found!');
  console.error(`   Expected cert: ${SSL_CERT_PATH}`);
  console.error(`   Expected key: ${SSL_KEY_PATH}`);
  console.error('');
  console.error('🔧 To generate SSL certificates, run:');
  console.error('   sudo ./setup-ssl-quick.sh');
  process.exit(1);
}

// Start Node Media Server (RTMP)
const nms = new NodeMediaServer(nmsConfig);

nms.on('preConnect', (id, args) => {
  console.log('🔌 RTMP client connecting:', args.app, args.flashVer);
});

nms.on('postConnect', (id, args) => {
  console.log('✅ RTMP client connected:', id);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('📡 Stream starting:', StreamPath);
  const streamKey = StreamPath.split('/').pop();
  if (streamKey && streamKey.startsWith('nf_')) {
    console.log('✅ Valid NightFlow stream key:', streamKey);
  } else {
    console.log('❌ Invalid stream key format:', streamKey);
  }
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('🔴 Stream published:', StreamPath);
  const streamKey = StreamPath.split('/').pop();
  console.log(`📺 Stream available at: https://67.205.179.77:${HTTPS_PORT}/live/${streamKey}/index.m3u8`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('⚫ Stream ended:', StreamPath);
});

nms.run();
console.log(`🎥 RTMP Server started on port ${RTMP_PORT}`);

// Start HTTPS server
try {
  const httpsOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  };
  
  const httpsServer = https.createServer(httpsOptions, app);
  
  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🔒✅ HTTPS Streaming Server Online!');
    console.log('');
    console.log('📊 Server Status:');
    console.log(`   HTTPS API: https://67.205.179.77:${HTTPS_PORT}`);
    console.log(`   RTMP Input: rtmp://67.205.179.77:${RTMP_PORT}/live`);
    console.log(`   HLS Output: https://67.205.179.77:${HTTPS_PORT}/live/[streamKey]/index.m3u8`);
    console.log('');
    console.log('🎯 OBS Setup:');
    console.log(`   Server: rtmp://67.205.179.77:${RTMP_PORT}/live`);
    console.log('   Stream Key: Generate from NightFlow app (starts with nf_)');
    console.log('');
    console.log('✅ NightFlow app can now connect securely via HTTPS!');
  });
  
  httpsServer.on('error', (error) => {
    console.error('❌ HTTPS Server Error:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Failed to start HTTPS server:', error);
  process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Shutting down NightFlow streaming server...');
  nms.stop();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);