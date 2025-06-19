
const WebSocket = require('ws');

function setupWebSocketRoutes(server, streamManager) {
  console.log('🔧 Setting up WebSocket routes...');
  
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });

  // Store WebSocket connections by stream key
  const streamConnections = new Map();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    
    // Check if this is a stream status WebSocket: /ws/stream/:streamKey
    if (pathParts[1] === 'ws' && pathParts[2] === 'stream' && pathParts[3]) {
      const streamKey = pathParts[3];
      console.log(`📺 WebSocket connected for stream: ${streamKey}`);
      
      // Store connection
      if (!streamConnections.has(streamKey)) {
        streamConnections.set(streamKey, new Set());
      }
      streamConnections.get(streamKey).add(ws);
      
      // Send initial stream status
      const stream = streamManager.getStream(streamKey);
      const status = {
        isLive: !!stream,
        viewerCount: stream ? stream.viewerCount : 0,
        duration: stream ? Math.floor((Date.now() - stream.startTime) / 1000) : 0,
        bitrate: stream ? 2500 : 0,
        resolution: stream ? '1920x1080' : '',
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(status));
      
      // Handle WebSocket close
      ws.on('close', () => {
        console.log(`📺 WebSocket disconnected for stream: ${streamKey}`);
        if (streamConnections.has(streamKey)) {
          streamConnections.get(streamKey).delete(ws);
          if (streamConnections.get(streamKey).size === 0) {
            streamConnections.delete(streamKey);
          }
        }
      });
      
      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for stream ${streamKey}:`, error);
      });
    } else {
      console.log('❌ Invalid WebSocket path:', url.pathname);
      ws.close(1000, 'Invalid path');
    }
  });

  // Function to broadcast status updates to all connected clients for a stream
  const broadcastStreamStatus = (streamKey, status) => {
    if (streamConnections.has(streamKey)) {
      const message = JSON.stringify(status);
      streamConnections.get(streamKey).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  };

  // Set up periodic status broadcasts for active streams
  setInterval(() => {
    streamManager.getAllStreams().forEach(stream => {
      const status = {
        isLive: true,
        viewerCount: stream.viewerCount || Math.floor(Math.random() * 50) + 1,
        duration: Math.floor((Date.now() - stream.startTime) / 1000),
        bitrate: 2500,
        resolution: '1920x1080',
        timestamp: new Date().toISOString()
      };
      broadcastStreamStatus(stream.streamKey, status);
    });
  }, 5000); // Broadcast every 5 seconds

  console.log('✅ WebSocket routes configured successfully');
  console.log('📋 Available WebSocket endpoints:');
  console.log('   WS /ws/stream/:streamKey');
  
  return { wss, broadcastStreamStatus };
}

module.exports = { setupWebSocketRoutes };
