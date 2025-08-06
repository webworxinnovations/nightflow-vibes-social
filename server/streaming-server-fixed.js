#!/usr/bin/env node

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');

console.log('🚀 Starting NightFlow Streaming Server v3.0.0...');

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'nightflow-streaming-server',
    version: '3.0.0',
    uptime: Math.floor(process.uptime()),
    ports: {
      http: 8888,
      https: 3443,
      rtmp: 1935
    },
    ssl_enabled: process.env.SSL_ENABLED === 'true',
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    streaming_server: 'online',
    rtmp_ready: true,
    rtmp_port: 1935,
    rtmp_url: 'rtmp://67.205.179.77:1935/live',
    hls_ready: true,
    hls_url: process.env.SSL_ENABLED === 'true' ? 
      'https://67.205.179.77:3443/live' : 
      'http://67.205.179.77:8888/live',
    websocket_ready: true,
    ssl_enabled: process.env.SSL_ENABLED === 'true'
  });
});

// Serve HLS files from the media directory
app.use('/live', express.static('/tmp/media', {
  setHeaders: (res, path, stat) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    if (path.endsWith('.m3u8')) {
      res.set('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (path.endsWith('.ts')) {
      res.set('Content-Type', 'video/mp2t');
    }
  }
}));

// RTMP Configuration
const nmsConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8889, // Internal port for Node Media Server
    allow_origin: '*',
    mediaroot: '/tmp/media'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: 'rtmp://127.0.0.1:1935/live'
      }
    ]
  }
};

// Initialize Node Media Server
const nms = new NodeMediaServer(nmsConfig);

nms.on('preConnect', (id, args) => {
  console.log('🔗 RTMP Client connecting:', id, 'App:', args.app, 'Stream:', args.name);
});

nms.on('postConnect', (id, args) => {
  console.log('✅ RTMP Client connected:', id);
});

nms.on('doneConnect', (id, args) => {
  console.log('❌ RTMP Client disconnected:', id);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('🎬 Stream started:', StreamPath);
  console.log('📡 Stream Key:', args.name);
  
  // Validate stream key format
  if (!args.name.startsWith('nf_')) {
    console.log('❌ Invalid stream key format:', args.name);
    return false;
  }
  
  console.log('✅ Stream key validated');
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('🔴 Stream is now LIVE:', StreamPath);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('⚫ Stream ended:', StreamPath);
});

// Start Node Media Server
nms.run();
console.log('📺 RTMP Server started on port 1935');

// Start HTTP Server
const httpServer = http.createServer(app);
httpServer.listen(8888, '0.0.0.0', () => {
  console.log('🌐 HTTP Server running on port 8888');
  console.log('📍 HTTP Health: http://67.205.179.77:8888/health');
});

// Start HTTPS Server if SSL is enabled
if (process.env.SSL_ENABLED === 'true') {
  const httpsOptions = {
    key: fs.readFileSync('/etc/ssl/private/nightflow.key'),
    cert: fs.readFileSync('/etc/ssl/certs/nightflow.crt')
  };
  
  const httpsServer = https.createServer(httpsOptions, app);
  httpsServer.listen(3443, '0.0.0.0', () => {
    console.log('🔒 HTTPS Server running on port 3443');
    console.log('📍 HTTPS Health: https://67.205.179.77:3443/health');
    console.log('🎯 HLS Streaming: https://67.205.179.77:3443/live/[streamKey]/index.m3u8');
  });
}

// Create media directory
const mediaDir = '/tmp/media';
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
  console.log('📁 Created media directory:', mediaDir);
}

console.log('✅ NightFlow Streaming Server is ready!');
console.log('🎯 RTMP URL: rtmp://67.205.179.77:1935/live');
console.log('🎯 HLS URL: https://67.205.179.77:3443/live/[streamKey]/index.m3u8');

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  httpServer.close();
  if (process.env.SSL_ENABLED === 'true') {
    httpsServer.close();
  }
  nms.stop();
  process.exit(0);
});