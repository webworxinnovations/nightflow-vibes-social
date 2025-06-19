
// Node.js streaming server setup
// Run this with: node server/streaming-server.js

const NodeMediaServer = require('node-media-server');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

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
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nightflow Streaming Server',
    status: 'running',
    endpoints: {
      health: '/health',
      streamStatus: '/api/stream/:streamKey/status',
      streamValidation: '/api/stream/:streamKey/validate'
    }
  });
});

// Use environment variable for port, with Railway's default
const API_PORT = process.env.PORT || 3001;
const RTMP_PORT = process.env.RTMP_PORT || 1935;
const HTTP_PORT = process.env.HTTP_PORT || 8080;

// Media server configuration
const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: HTTP_PORT,
    mediaroot: './media',
    allow_origin: '*'
  }
};

// API routes
app.get('/api/stream/:streamKey/status', (req, res) => {
  const { streamKey } = req.params;
  const stream = activeStreams.get(streamKey);
  
  if (stream) {
    const duration = Math.floor((Date.now() - stream.startTime) / 1000);
    res.json({
      isLive: true,
      viewerCount: stream.viewerCount,
      duration,
      bitrate: 2500, // Mock bitrate
      resolution: '1920x1080'
    });
  } else {
    res.json({
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: ''
    });
  }
});

app.get('/api/stream/:streamKey/validate', (req, res) => {
  const { streamKey } = req.params;
  
  // Basic validation - in production, validate against database
  if (streamKey && streamKey.startsWith('nf_')) {
    res.json({ valid: true });
  } else {
    res.status(400).json({ valid: false, error: 'Invalid stream key format' });
  }
});

// Create HTTP server first
const server = require('http').createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/');
  
  if (pathParts[1] === 'stream' && pathParts[3] === 'status') {
    const streamKey = pathParts[2];
    
    // Add client to stream's client list
    if (!streamClients.has(streamKey)) {
      streamClients.set(streamKey, new Set());
    }
    streamClients.get(streamKey).add(ws);
    
    console.log(`WebSocket client connected for stream: ${streamKey}`);
    
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
    }
    
    ws.on('close', () => {
      streamClients.get(streamKey)?.delete(ws);
      console.log(`WebSocket client disconnected for stream: ${streamKey}`);
    });
  }
});

// Start the HTTP/WebSocket server first
server.listen(API_PORT, () => {
  console.log(`API server running on port ${API_PORT}`);
});

// Only start media server if not in Railway environment or if explicitly enabled
if (process.env.ENABLE_MEDIA_SERVER !== 'false') {
  try {
    const nms = new NodeMediaServer(config);

    // Stream event handlers
    nms.on('prePublish', (id, StreamPath, args) => {
      console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      // Extract stream key from path
      const streamKey = StreamPath.split('/').pop();
      
      // Validate stream key (basic validation for demo)
      if (!streamKey || !streamKey.startsWith('nf_')) {
        console.log('Invalid stream key, rejecting stream');
        return false;
      }
      
      // Store stream info
      activeStreams.set(streamKey, {
        id,
        streamPath: StreamPath,
        startTime: Date.now(),
        viewerCount: 0
      });
      
      console.log(`Stream started: ${streamKey}`);
    });

    nms.on('donePublish', (id, StreamPath, args) => {
      console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      const streamKey = StreamPath.split('/').pop();
      activeStreams.delete(streamKey);
      
      // Notify WebSocket clients
      if (streamClients.has(streamKey)) {
        const clients = streamClients.get(streamKey);
        clients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              isLive: false,
              viewerCount: 0,
              duration: 0,
              bitrate: 0,
              resolution: ''
            }));
          }
        });
      }
      
      console.log(`Stream ended: ${streamKey}`);
    });

    nms.run();
    console.log('Node Media Server started');
    console.log(`RTMP server running on port ${RTMP_PORT}`);
    console.log(`HTTP server running on port ${HTTP_PORT}`);
  } catch (error) {
    console.error('Failed to start Node Media Server:', error);
    console.log('Continuing with API server only...');
  }
} else {
  console.log('Media server disabled for this environment');
}

// Periodic status updates
setInterval(() => {
  activeStreams.forEach((stream, streamKey) => {
    const duration = Math.floor((Date.now() - stream.startTime) / 1000);
    const status = {
      isLive: true,
      viewerCount: stream.viewerCount + Math.floor(Math.random() * 3), // Simulate viewer changes
      duration,
      bitrate: 2500 + Math.floor(Math.random() * 500), // Simulate bitrate variation
      resolution: '1920x1080'
    };
    
    // Update stored viewer count
    stream.viewerCount = status.viewerCount;
    
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
}, 2000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
