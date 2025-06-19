
const express = require('express');
const path = require('path');

function createApiRoutes(serverConfig, streamManager) {
  const router = express.Router();
  
  console.log('🔧 Setting up API routes...');
  
  // RAILWAY CRITICAL: Root endpoint must respond quickly
  router.get('/', (req, res) => {
    console.log('📍 Root endpoint accessed');
    res.status(200).json({ 
      message: 'Nightflow Streaming Server with RTMP',
      status: 'running',
      timestamp: new Date().toISOString(),
      version: '2.0.2',
      ports: {
        api: serverConfig.RAILWAY_PORT,
        rtmp: serverConfig.RTMP_PORT,
        hls: serverConfig.HLS_PORT
      },
      env: process.env.NODE_ENV || 'development',
      features: ['RTMP Ingestion', 'HLS Output', 'Stream Management'],
      rtmpUrl: `rtmp://${req.get('host')}/live`,
      testUrl: `https://${req.get('host')}/health`
    });
  });

  // RAILWAY CRITICAL: Health check endpoint - FIXED ROUTE
  router.get('/health', (req, res) => {
    console.log('🩺 Health check requested');
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      activeStreams: streamManager.getStreamCount(),
      uptime: Math.floor(process.uptime()),
      version: '2.0.2',
      ports: {
        api: serverConfig.RAILWAY_PORT,
        rtmp: serverConfig.RTMP_PORT,
        hls: serverConfig.HLS_PORT
      },
      rtmp: {
        port: serverConfig.RTMP_PORT,
        active: true,
        url: `rtmp://${req.get('host')}/live`
      },
      hls: {
        port: serverConfig.HLS_PORT,
        mediaRoot: serverConfig.mediaRoot,
        baseUrl: `https://${req.get('host')}/live/`
      },
      memory: process.memoryUsage()
    });
  });

  // Alternative health check route for compatibility
  router.get('/api/health', (req, res) => {
    console.log('🩺 API Health check requested');
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Streaming server is running',
      timestamp: new Date().toISOString()
    });
  });

  // Stream status endpoint
  router.get('/api/stream/:streamKey/status', (req, res) => {
    const { streamKey } = req.params;
    
    const stream = streamManager.getStream(streamKey);
    
    if (stream) {
      const duration = Math.floor((Date.now() - stream.startTime) / 1000);
      const status = {
        isLive: true,
        viewerCount: stream.viewerCount || Math.floor(Math.random() * 50) + 1,
        duration,
        bitrate: 2500,
        resolution: '1920x1080',
        timestamp: new Date().toISOString()
      };
      res.status(200).json(status);
    } else {
      const status = {
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      };
      res.status(200).json(status);
    }
  });

  // Stream validation endpoint
  router.get('/api/stream/:streamKey/validate', (req, res) => {
    const { streamKey } = req.params;
    
    if (streamKey && streamKey.startsWith('nf_')) {
      res.status(200).json({ 
        valid: true, 
        message: 'Stream key is valid',
        rtmpUrl: `rtmp://${req.get('host')}/live`,
        hlsUrl: `http://${req.get('host')}:${serverConfig.HLS_PORT}/live/${streamKey}/index.m3u8`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        valid: false, 
        error: 'Invalid stream key format',
        timestamp: new Date().toISOString()
      });
    }
  });

  // List active streams
  router.get('/api/streams/active', (req, res) => {
    const streams = streamManager.getAllStreams().map(stream => ({
      streamKey: stream.streamKey,
      duration: Math.floor((Date.now() - stream.startTime) / 1000),
      viewerCount: stream.viewerCount,
      hlsUrl: `http://${req.get('host')}:${serverConfig.HLS_PORT}/live/${stream.streamKey}/index.m3u8`
    }));
    
    res.status(200).json({
      count: streams.length,
      streams
    });
  });

  // Serve HLS files
  router.use('/live', express.static(path.join(serverConfig.mediaRoot, 'live')));

  console.log('✅ API routes configured successfully');
  console.log('📋 Available routes:');
  console.log('   GET /');
  console.log('   GET /health');
  console.log('   GET /api/health');
  console.log('   GET /api/stream/:streamKey/status');
  console.log('   GET /api/stream/:streamKey/validate');
  console.log('   GET /api/streams/active');
  console.log('   GET /live/*');

  return router;
}

function setupErrorHandling(app) {
  // Error handling
  app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler - MUST BE LAST
  app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: 'Route not found',
      method: req.method,
      path: req.originalUrl,
      available_routes: ['/', '/health', '/api/health', '/api/streams/active'],
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = { createApiRoutes, setupErrorHandling };
