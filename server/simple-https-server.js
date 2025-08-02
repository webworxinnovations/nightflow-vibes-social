const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'Nightflow HTTPS Test Server',
    ssl: 'enabled'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    api: 'functional',
    timestamp: new Date().toISOString()
  });
});

// Basic stream status endpoint
app.get('/api/streams/:streamKey/status', (req, res) => {
  res.json({
    streamKey: req.params.streamKey,
    status: 'testing',
    message: 'HTTPS server is working'
  });
});

// Mock HLS endpoint for testing
app.get('/live/:streamKey/index.m3u8', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(`#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ENDLIST
`);
});

const PORT_HTTP = 3001;
const PORT_HTTPS = 3443;

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT_HTTP, '0.0.0.0', () => {
  console.log(`✅ HTTP Server running on http://67.205.179.77:${PORT_HTTP}`);
  console.log(`🔗 Health: http://67.205.179.77:${PORT_HTTP}/health`);
});

// Start HTTPS server
const SSL_CERT_PATH = '/etc/ssl/certs/server.crt';
const SSL_KEY_PATH = '/etc/ssl/private/server.key';

if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH)
    };
    
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(PORT_HTTPS, '0.0.0.0', () => {
      console.log(`✅ HTTPS Server running on https://67.205.179.77:${PORT_HTTPS}`);
      console.log(`🔗 Health: https://67.205.179.77:${PORT_HTTPS}/health`);
      console.log(`🔗 API Health: https://67.205.179.77:${PORT_HTTPS}/api/health`);
      console.log(`📺 HLS Test: https://67.205.179.77:${PORT_HTTPS}/live/test_stream/index.m3u8`);
    });
    
    httpsServer.on('error', (error) => {
      console.error('❌ HTTPS Server Error:', error);
    });
    
  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error);
  }
} else {
  console.warn('⚠️ SSL certificates not found. HTTPS server will not start.');
  console.warn(`   Expected cert: ${SSL_CERT_PATH}`);
  console.warn(`   Expected key: ${SSL_KEY_PATH}`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down servers...');
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  httpServer.close();
  process.exit(0);
});