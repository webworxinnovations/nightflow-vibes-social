#!/bin/bash

# Complete NightFlow Droplet Setup Script
# This will delete everything and set up a fresh streaming server

set -e

echo "🔥 COMPLETE NIGHTFLOW DROPLET RESET & SETUP"
echo "================================================"
echo "This will:"
echo "1. Stop all existing processes"
echo "2. Delete old installations"
echo "3. Install fresh streaming server with RTMP + HTTPS"
echo "4. Configure for OBS streaming"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $ROPLET_IP}EPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

# 1. CLEAN SLATE - Stop everything
echo "🧹 Cleaning existing setup..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo fuser -k 1935/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
sudo fuser -k 3443/tcp 2>/dev/null || true
sudo fuser -k 9001/tcp 2>/dev/null || true

# 2. Remove old installations
echo "🗑️ Removing old files..."
rm -rf /var/www/nightflow-server 2>/dev/null || true
rm -rf /tmp/media 2>/dev/null || true

# 3. Create fresh directory
echo "📁 Creating fresh installation..."
mkdir -p /var/www/nightflow-server
cd /var/www/nightflow-server

# 4. Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 5. Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2 2>/dev/null || sudo npm install -g pm2

# 6. Create package.json
echo "📝 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "nightflow-streaming-server",
  "version": "3.0.0",
  "description": "Complete RTMP+HTTPS streaming server for NightFlow",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-media-server": "^2.6.3",
    "ws": "^8.14.0"
  }
}
EOF

# 7. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 8. Generate SSL certificates
echo "🔐 Generating SSL certificates..."
mkdir -p /etc/ssl/certs /etc/ssl/private
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/server.key \
  -out /etc/ssl/certs/server.crt \
  -subj "/C=US/ST=State/L=City/O=NightFlow/CN=67.205.179.77" 2>/dev/null || true

chmod 600 /etc/ssl/private/server.key
chmod 644 /etc/ssl/certs/server.crt

# 9. Create the complete streaming server
echo "🚀 Creating streaming server..."
cat > server.js << 'EOF'
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');
const path = require('path');

const app = express();

// CORS for Lovable compatibility
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('public'));

// Create media directory
const mediaPath = '/tmp/media';
if (!fs.existsSync(mediaPath)) {
  fs.mkdirSync(mediaPath, { recursive: true });
  fs.mkdirSync(path.join(mediaPath, 'live'), { recursive: true });
}

console.log('📁 Media directory:', mediaPath);

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'NightFlow Complete Streaming Server v3.0',
    rtmp: 'rtmp://67.205.179.77:1935/live',
    hls: 'https://67.205.179.77:3443/live/[STREAM_KEY]/index.m3u8',
    ssl: 'enabled'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    api: 'functional',
    timestamp: new Date().toISOString(),
    streaming: 'ready'
  });
});

// Stream validation endpoint
app.get('/api/validate/:streamKey', (req, res) => {
  const streamKey = req.params.streamKey;
  console.log('🔑 Validating stream key:', streamKey);
  
  if (!streamKey || !streamKey.startsWith('nf_')) {
    return res.status(400).json({ valid: false, error: 'Invalid stream key format' });
  }
  
  res.json({ 
    valid: true, 
    streamKey,
    rtmpUrl: 'rtmp://67.205.179.77:1935/live',
    hlsUrl: `https://67.205.179.77:3443/live/${streamKey}/index.m3u8`
  });
});

// Serve HLS files with proper headers
app.use('/live', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  const filePath = path.join(mediaPath, req.path);
  
  if (req.path.endsWith('.m3u8')) {
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
  } else if (req.path.endsWith('.ts')) {
    res.set('Content-Type', 'video/mp2t');
  }
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('📹 HLS file not found:', filePath);
      res.status(404).json({ error: 'Stream not found' });
    }
  });
});

// RTMP Server Configuration
const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    listen: '0.0.0.0'
  },
  http: {
    port: 9001,
    allow_origin: '*',
    mediaroot: mediaPath,
    listen: '0.0.0.0'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: []
  }
});

// RTMP Events
nms.on('preConnect', (id, args) => {
  console.log('🔗 RTMP Pre-Connect:', id, args);
});

nms.on('postConnect', (id, args) => {
  console.log('✅ RTMP Connected:', id);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('📡 RTMP Pre-Publish:', id, StreamPath);
  const streamKey = StreamPath.replace('/live/', '');
  console.log('🔑 Stream Key:', streamKey);
  
  if (!streamKey.startsWith('nf_')) {
    console.log('❌ Invalid stream key format:', streamKey);
    return false;
  }
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('🔴 STREAM STARTED:', StreamPath);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('⚫ STREAM ENDED:', StreamPath);
});

// Start RTMP server
nms.run();
console.log('🎬 RTMP Server started on port 1935');

// Start HTTP server (port 3001)
const httpServer = http.createServer(app);
httpServer.listen(3001, '0.0.0.0', () => {
  console.log('🌐 HTTP Server running on port 3001');
  console.log('🔗 Health: http://67.205.179.77:3001/health');
});

// Start HTTPS server (port 3443) 
const SSL_CERT_PATH = '/etc/ssl/certs/server.crt';
const SSL_KEY_PATH = '/etc/ssl/private/server.key';

if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };
    
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(3443, '0.0.0.0', () => {
      console.log('🔒 HTTPS Server running on port 3443');
      console.log('🔗 HTTPS Health: https://67.205.179.77:3443/health');
      console.log('✅ NightFlow app can now connect securely!');
    });
    
  } catch (error) {
    console.error('❌ HTTPS Server failed:', error);
  }
} else {
  console.warn('⚠️ SSL certificates not found');
}

// Graceful shutdown
const shutdown = () => {
  console.log('🛑 Shutting down NightFlow server...');
  nms.stop();
  httpServer.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('🎉 NightFlow Complete Streaming Server v3.0 Ready!');
console.log('📋 OBS Settings:');
console.log('   Server: rtmp://67.205.179.77:1935/live');
console.log('   Stream Key: Generate in NightFlow app (starts with nf_)');
EOF

# 10. Start the server
echo "🚀 Starting NightFlow server..."
pm2 start server.js --name "nightflow-complete" --env production

# 11. Save PM2 configuration
pm2 save
pm2 startup || echo "PM2 startup already configured"

# 12. Wait and test
echo "⏳ Waiting for server to initialize..."
sleep 10

# 13. Final status check
echo ""
echo "🎉 NIGHTFLOW SETUP COMPLETE!"
echo "=================================="
echo ""
echo "✅ Services Status:"
pm2 list
echo ""
echo "🔗 URLs:"
echo "   HTTP Health:  http://67.205.179.77:3001/health"
echo "   HTTPS Health: https://67.205.179.77:3443/health"
echo ""
echo "📋 OBS Configuration:"
echo "   Server: rtmp://67.205.179.77:1935/live"
echo "   Stream Key: Generate in your NightFlow app"
echo ""
echo "🧪 Testing endpoints..."
curl -s http://67.205.179.77:3001/health | head -5 || echo "❌ HTTP test failed"
curl -sk https://67.205.179.77:3443/health | head -5 || echo "❌ HTTPS test failed"
echo ""
echo "✅ Setup complete! Your OBS should now stream through NightFlow!"