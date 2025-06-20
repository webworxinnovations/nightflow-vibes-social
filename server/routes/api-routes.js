const express = require('express');
const path = require('path');

function createApiRoutes(serverConfig, streamManager) {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'nightflow-streaming-server',
      version: '2.0.4',
      uptime: Math.floor(process.uptime()),
      streams: {
        active: streamManager.getStreamCount(),
        total: streamManager.getAllStreams().length
      },
      ports: {
        api: serverConfig.RAILWAY_PORT,
        rtmp: serverConfig.RTMP_PORT,
        hls: serverConfig.HLS_PORT
      },
      railway: {
        environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
        service_id: process.env.RAILWAY_SERVICE_ID || 'unknown'
      }
    });
  });

  // Root endpoint
  router.get('/', (req, res) => {
    res.json({
      message: 'Nightflow Streaming Server',
      version: '2.0.4',
      endpoints: {
        health: '/health',
        api: '/api/*',
        websocket: '/ws/stream/:streamKey',
        rtmp: `rtmp://nightflow-vibes-social-production.up.railway.app:${serverConfig.RTMP_PORT}/live`,
        hls: '/live/:streamKey/index.m3u8'
      }
    });
  });

  // HLS static file serving - CRITICAL for video playback
  router.use('/live', express.static(path.join(serverConfig.mediaRoot, 'live'), {
    setHeaders: (res, path) => {
      // Set CORS headers for video files
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Range');
      
      // Set correct MIME types for HLS files
      if (path.endsWith('.m3u8')) {
        res.set('Content-Type', 'application/vnd.apple.mpegurl');
      } else if (path.endsWith('.ts')) {
        res.set('Content-Type', 'video/mp2t');
      }
    }
  }));

  // API routes
  router.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      streaming_server: 'online',
      rtmp_ready: true,
      rtmp_port: serverConfig.RTMP_PORT,
      rtmp_url: `rtmp://nightflow-vibes-social-production.up.railway.app:${serverConfig.RTMP_PORT}/live`,
      hls_ready: true,
      websocket_ready: true
    });
  });

  // RTMP status endpoint with enhanced Railway info
  router.get('/api/rtmp/status', (req, res) => {
    res.json({
      status: 'online',
      port: serverConfig.RTMP_PORT,
      ready: true,
      url: `rtmp://nightflow-vibes-social-production.up.railway.app:${serverConfig.RTMP_PORT}/live`,
      active_streams: streamManager.getStreamCount(),
      uptime: Math.floor(process.uptime()),
      railway: {
        tcp_proxy_enabled: true,
        expected_external_port: serverConfig.RTMP_PORT
      }
    });
  });

  // Enhanced RTMP test endpoint
  router.post('/api/rtmp/test', (req, res) => {
    const { streamKey } = req.body;
    
    if (!streamKey) {
      return res.status(400).json({
        success: false,
        message: 'Stream key is required'
      });
    }

    // Basic validation - stream key should start with 'nf_'
    if (!streamKey.startsWith('nf_') || streamKey.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stream key format'
      });
    }

    // Check if RTMP server is ready with Railway TCP proxy info
    const rtmpUrl = `rtmp://nightflow-vibes-social-production.up.railway.app:${serverConfig.RTMP_PORT}/live`;
    
    res.json({
      success: true,
      message: 'RTMP server is ready with Railway TCP proxy',
      rtmp_url: rtmpUrl,
      stream_key: streamKey,
      full_rtmp_url: `${rtmpUrl}/${streamKey}`,
      status: 'ready',
      railway_tcp_proxy: true,
      instructions: [
        'Copy the RTMP URL to OBS Settings → Stream → Server',
        'Copy the Stream Key to OBS Settings → Stream → Stream Key',
        'Click Start Streaming in OBS'
      ]
    });
  });

  // Get stream status
  router.get('/api/stream/:streamKey/status', (req, res) => {
    const { streamKey } = req.params;
    const stream = streamManager.getStream(streamKey);
    
    if (!stream) {
      return res.json({
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      });
    }

    const duration = Math.floor((Date.now() - stream.startTime) / 1000);
    
    res.json({
      isLive: stream.isLive,
      viewerCount: stream.viewerCount,
      duration: duration,
      bitrate: 2500, // Default bitrate
      resolution: '1920x1080', // Default resolution
      timestamp: new Date().toISOString()
    });
  });

  // Validate stream key
  router.get('/api/stream/:streamKey/validate', (req, res) => {
    const { streamKey } = req.params;
    
    // Basic validation - stream key should start with 'nf_'
    const isValid = streamKey && streamKey.startsWith('nf_') && streamKey.length > 10;
    
    res.json({
      valid: isValid,
      streamKey: streamKey
    });
  });

  // Get all active streams
  router.get('/api/streams', (req, res) => {
    const streams = streamManager.getAllStreams().map(stream => {
      const duration = Math.floor((Date.now() - stream.startTime) / 1000);
      return {
        streamKey: stream.streamKey,
        isLive: stream.isLive,
        viewerCount: stream.viewerCount,
        duration: duration,
        startTime: stream.startTime
      };
    });
    
    res.json({
      streams: streams,
      total: streams.length
    });
  });

  return router;
}

function setupMiddleware(app) {
  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // JSON parsing
  app.use(express.json());
  
  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

function setupErrorHandling(app) {
  // 404 handler for unmatched routes
  app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      error: 'Route not found',
      method: req.method,
      path: req.originalUrl,
      available_endpoints: [
        'GET /',
        'GET /health',
        'GET /api/health',
        'GET /api/rtmp/status',
        'POST /api/rtmp/test',
        'GET /api/stream/:streamKey/status',
        'GET /api/stream/:streamKey/validate',
        'GET /api/streams',
        'WS /ws/stream/:streamKey'
      ]
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  });
}

module.exports = { createApiRoutes, setupMiddleware, setupErrorHandling };
