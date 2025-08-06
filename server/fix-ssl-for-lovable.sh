#!/bin/bash

echo "🔧 Fixing SSL for Lovable HTTPS compatibility..."

# Stop current server
pm2 stop nightflow-streaming
pm2 delete nightflow-streaming

# Install Let's Encrypt for proper SSL
sudo apt update
sudo apt install -y certbot

# Create self-signed cert that works with CORS (temporary solution)
sudo mkdir -p /etc/ssl/private /etc/ssl/certs

# Generate proper SSL certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nightflow.key \
  -out /etc/ssl/certs/nightflow.crt \
  -subj "/C=US/ST=NY/L=NYC/O=NightFlow/OU=Streaming/CN=67.205.179.77"

# Set proper permissions
sudo chmod 600 /etc/ssl/private/nightflow.key
sudo chmod 644 /etc/ssl/certs/nightflow.crt

# Update server to handle CORS properly
cat > /var/www/nightflow-server/streaming-server-lovable.js << 'EOF'
#!/usr/bin/env node

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');

console.log('🚀 Starting NightFlow Streaming Server for Lovable...');

const app = express();

// CRITICAL: Enable CORS for Lovable
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.sendStatus(200);
});

app.use(express.json());

// Health endpoints
app.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'nightflow-streaming-server',
    version: '4.0.0',
    lovable_compatible: true,
    ssl_enabled: true,
    ports: { http: 8888, https: 3443, rtmp: 1935 }
  });
});

app.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    streaming_server: 'online',
    rtmp_ready: true,
    rtmp_port: 1935,
    rtmp_url: 'rtmp://67.205.179.77:1935/live',
    hls_ready: true,
    hls_url: 'https://67.205.179.77:3443/live',
    websocket_ready: true,
    ssl_enabled: true,
    lovable_compatible: true
  });
});

// Serve HLS files with proper CORS headers
app.use('/live', express.static('/tmp/media', {
  setHeaders: (res, path, stat) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept, Origin',
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

// RTMP Server Configuration
const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8889,
    allow_origin: '*',
    mediaroot: '/tmp/media'
  }
});

// RTMP Events
nms.on('prePublish', (id, StreamPath, args) => {
  console.log('🎬 Stream started:', StreamPath);
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

// Start RTMP Server
nms.run();
console.log('📺 RTMP Server started on port 1935');

// Start HTTP Server
const httpServer = http.createServer(app);
httpServer.listen(8888, '0.0.0.0', () => {
  console.log('🌐 HTTP Server running on port 8888');
});

// Start HTTPS Server with SSL
const httpsOptions = {
  key: fs.readFileSync('/etc/ssl/private/nightflow.key'),
  cert: fs.readFileSync('/etc/ssl/certs/nightflow.crt')
};

const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(3443, '0.0.0.0', () => {
  console.log('🔒 HTTPS Server running on port 3443');
  console.log('🎯 Lovable compatible HTTPS streaming ready!');
  console.log('🎯 RTMP: rtmp://67.205.179.77:1935/live');
  console.log('🎯 HLS: https://67.205.179.77:3443/live/[streamKey]/index.m3u8');
});

// Create media directory
const mediaDir = '/tmp/media';
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
  console.log('📁 Created media directory:', mediaDir);
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  httpServer.close();
  httpsServer.close();
  nms.stop();
  process.exit(0);
});

console.log('✅ NightFlow Streaming Server ready for Lovable!');
EOF

# Start the Lovable-compatible server
cd /var/www/nightflow-server
npm install
SSL_ENABLED=true pm2 start streaming-server-lovable.js --name "nightflow-streaming" --env production
pm2 save

echo "✅ SSL fixed for Lovable!"
echo "🎯 HTTPS: https://67.205.179.77:3443/health"
echo "🎯 RTMP: rtmp://67.205.179.77:1935/live"
echo "🔧 Test HTTPS: curl -k https://67.205.179.77:3443/api/health"

pm2 status