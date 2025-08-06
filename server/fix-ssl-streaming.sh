#!/bin/bash

echo "🔧 Fixing SSL streaming server..."

# Stop all streaming processes
pm2 stop nightflow-streaming 2>/dev/null || true
pm2 delete nightflow-streaming 2>/dev/null || true
pm2 stop https-streaming 2>/dev/null || true
pm2 delete https-streaming 2>/dev/null || true

# Kill processes on ports
sudo fuser -k 1935/tcp 2>/dev/null || true
sudo fuser -k 3443/tcp 2>/dev/null || true
sudo fuser -k 9001/tcp 2>/dev/null || true

echo "🔒 Setting up SSL certificates..."
cd /var/www/nightflow-server

# Remove old certificates
sudo rm -f /etc/ssl/private/server.key
sudo rm -f /etc/ssl/certs/server.crt

# Create SSL directories
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

# Generate new self-signed certificate with proper format
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/server.key \
  -out /etc/ssl/certs/server.crt \
  -subj "/C=US/ST=NY/L=NYC/O=NightFlow/CN=67.205.179.77" \
  -config <(
    echo '[distinguished_name]'
    echo '[req]'
    echo 'distinguished_name = distinguished_name'
    echo '[v3_req]'
    echo 'keyUsage = keyEncipherment, dataEncipherment'
    echo 'extendedKeyUsage = serverAuth'
  )

# Set proper permissions
sudo chmod 600 /etc/ssl/private/server.key
sudo chmod 644 /etc/ssl/certs/server.crt

echo "📦 Installing required packages..."
npm install express cors node-media-server

echo "🚀 Creating fixed HTTPS streaming server..."
cat > fixed-https-streaming.js << 'EOF'
const express = require('express');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'NightFlow HTTPS Streaming Server',
    rtmp: 'rtmp://67.205.179.77:1935/live',
    hls: 'https://67.205.179.77:3443/live'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

// Serve HLS files with proper CORS headers
app.use('/live', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  const filePath = path.join('/var/www/nightflow-server/media', req.path);
  
  if (fs.existsSync(filePath)) {
    if (req.path.endsWith('.m3u8')) {
      res.set('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (req.path.endsWith('.ts')) {
      res.set('Content-Type', 'video/mp2t');
    }
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Stream not found' });
  }
});

// Node Media Server configuration
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8888,
    allow_origin: '*',
    mediaroot: '/var/www/nightflow-server/media'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [{
      app: 'live',
      mode: 'push',
      edge: 'rtmp://127.0.0.1:1935/live'
    }]
  }
};

const nms = new NodeMediaServer(config);

// Event handlers
nms.on('preConnect', (id, args) => {
  console.log('🔗 RTMP preConnect:', id, args);
});

nms.on('postConnect', (id, args) => {
  console.log('✅ RTMP postConnect:', id, args);
});

nms.on('prePublish', (id, streamPath, args) => {
  console.log('📡 Stream starting:', streamPath);
});

nms.on('postPublish', (id, streamPath, args) => {
  console.log('🎥 Stream published:', streamPath);
});

nms.on('donePublish', (id, streamPath, args) => {
  console.log('🛑 Stream ended:', streamPath);
});

// Start RTMP server
console.log('🎯 Starting RTMP server on port 1935...');
nms.run();

// Start HTTP server (for Node Media Server web interface)
console.log('📺 Starting HTTP server on port 8888...');

// Start HTTPS server for API and HLS
try {
  const sslOptions = {
    key: fs.readFileSync('/etc/ssl/private/server.key'),
    cert: fs.readFileSync('/etc/ssl/certs/server.crt')
  };

  const httpsServer = https.createServer(sslOptions, app);
  
  httpsServer.listen(3443, '0.0.0.0', () => {
    console.log('✅ HTTPS server running on port 3443');
    console.log('🔗 HTTPS API: https://67.205.179.77:3443');
    console.log('🎯 RTMP URL: rtmp://67.205.179.77:1935/live');
    console.log('📺 HLS URL: https://67.205.179.77:3443/live/YOUR_STREAM_KEY/index.m3u8');
  });

  httpsServer.on('error', (error) => {
    console.error('❌ HTTPS server error:', error);
  });

} catch (error) {
  console.error('❌ SSL setup failed:', error);
  console.log('🔄 Falling back to HTTP only...');
  
  // Fallback to HTTP
  const httpServer = http.createServer(app);
  httpServer.listen(3443, '0.0.0.0', () => {
    console.log('⚠️ Running in HTTP mode on port 3443');
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  nms.stop();
  process.exit(0);
});

console.log('🚀 NightFlow streaming server started!');
EOF

echo "🚀 Starting fixed HTTPS streaming server..."
pm2 start fixed-https-streaming.js --name "nightflow-streaming" --env production

echo "⏱️ Waiting for server to start..."
sleep 5

echo "✅ Fixed HTTPS streaming server is running!"
echo "🔗 HTTPS API: https://67.205.179.77:3443"
echo "🎯 RTMP URL: rtmp://67.205.179.77:1935/live"
echo "📺 Test URL: https://67.205.179.77:3443/health"