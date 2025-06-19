
// Simplified Node.js streaming server for Railway deployment
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

// Store active streams
const activeStreams = new Map();
const streamClients = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeStreams: activeStreams.size,
    uptime: process.uptime(),
    env: 'railway',
    port: process.env.PORT || 3001
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nightflow Streaming Server',
    status: 'running',
    env: 'railway',
    endpoints: {
      health: '/health',
      streamStatus: '/api/stream/:streamKey/status',
      streamValidation: '/api/stream/:streamKey/validate'
    }
  });
});

// Use Railway's PORT environment variable
const PORT = process.env.PORT || 3001;

// API routes
app.get('/api/stream/:streamKey/status', (req, res) => {
  const { streamKey } = req.params;
  const stream = activeStreams.get(streamKey);
  
  console.log(`Stream status check for: ${streamKey}`);
  
  if (stream) {
    const duration = Math.floor((Date.now() - stream.startTime) / 1000);
    const status = {
      isLive: true,
      viewerCount: stream.viewerCount,
      duration,
      bitrate: 2500,
      resolution: '1920x1080'
    };
    console.log(`Stream ${streamKey} is live:`, status);
    res.json(status);
  } else {
    const status = {
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: ''
    };
    console.log(`Stream ${streamKey} is offline`);
    res.json(status);
  }
});

app.get('/api/stream/:streamKey/validate', (req, res) => {
  const { streamKey } = req.params;
  
  console.log(`Stream validation for: ${streamKey}`);
  
  // Basic validation - accept any key that starts with 'nf_'
  if (streamKey && streamKey.startsWith('nf_')) {
    console.log(`Stream key ${streamKey} is valid`);
    res.json({ valid: true });
  } else {
    console.log(`Stream key ${streamKey} is invalid`);
    res.status(400).json({ valid: false, error: 'Invalid stream key format' });
  }
});

// Simulate stream going live (for testing)
app.post('/api/stream/:streamKey/start', (req, res) => {
  const { streamKey } = req.params;
  
  console.log(`Starting stream: ${streamKey}`);
  
  activeStreams.set(streamKey, {
    streamKey,
    startTime: Date.now(),
    viewerCount: Math.floor(Math.random() * 10) + 1
  });
  
  // Notify WebSocket clients
  if (streamClients.has(streamKey)) {
    const clients = streamClients.get(streamKey);
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          isLive: true,
          viewerCount: activeStreams.get(streamKey).viewerCount,
          duration: 0,
          bitrate: 2500,
          resolution: '1920x1080'
        }));
      }
    });
  }
  
  res.json({ success: true, message: 'Stream started' });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/');
  
  if (pathParts[1] === 'stream' && pathParts[3] === 'status') {
    const streamKey = pathParts[2];
    
    console.log(`WebSocket client connected for stream: ${streamKey}`);
    
    // Add client to stream's client list
    if (!streamClients.has(streamKey)) {
      streamClients.set(streamKey, new Set());
    }
    streamClients.get(streamKey).add(ws);
    
    // Send initial status
    const stream = activeStreams.get(streamKey);
    if (stream) {
      const duration = Math.floor((Date.now() - stream.startTime) / 1000);
      ws.send(JSON.stringify({
        isLive: true,
        viewerCount: stream.viewerCount,
        duration,
        bitrate: 2500,
        resolution: '1920x1080'
      }));
    } else {
      ws.send(JSON.stringify({
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: ''
      }));
    }
    
    ws.on('close', () => {
      console.log(`WebSocket client disconnected for stream: ${streamKey}`);
      streamClients.get(streamKey)?.delete(ws);
    });
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Nightflow Streaming Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: Railway`);
});

// Periodic status updates for active streams
setInterval(() => {
  activeStreams.forEach((stream, streamKey) => {
    const duration = Math.floor((Date.now() - stream.startTime) / 1000);
    
    // Simulate some viewer fluctuation
    stream.viewerCount = Math.max(1, stream.viewerCount + Math.floor(Math.random() * 3) - 1);
    
    const status = {
      isLive: true,
      viewerCount: stream.viewerCount,
      duration,
      bitrate: 2500 + Math.floor(Math.random() * 500),
      resolution: '1920x1080'
    };
    
    // Send to WebSocket clients
    if (streamClients.has(streamKey)) {
      const clients = streamClients.get(streamKey);
      clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(status));
        }
      });
    }
  });
}, 3000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
