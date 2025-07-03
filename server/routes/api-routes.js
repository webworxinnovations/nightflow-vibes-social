
const express = require('express');
const { createHealthRoutes } = require('./health-routes');
const { createRtmpRoutes } = require('./rtmp-routes');
const { createStreamRoutes } = require('./stream-routes');
const {
  setupCorsMiddleware,
  setupJsonMiddleware,
  setupLoggingMiddleware,
  setupStaticHlsMiddleware,
  setupErrorHandling
} = require('../middleware/api-middleware');

function createApiRoutes(serverConfig, streamManager) {
  const router = express.Router();

  // Root endpoint - MUST BE FIRST
  router.get('/', (req, res) => {
    console.log('📋 Root endpoint accessed');
    res.json({
      message: 'Nightflow Streaming Server - DigitalOcean Droplet',
      version: '2.2.0',
      status: 'operational',
      droplet_ip: '67.205.179.77',
      endpoints: {
        health: '/health',
        api_health: '/api/health',
        api: '/api/*',
        websocket: '/ws/stream/:streamKey',
        rtmp: `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`,
        hls: '/live/:streamKey/index.m3u8'
      },
      server_info: {
        api_port: serverConfig.DROPLET_PORT,
        rtmp_port: serverConfig.RTMP_PORT,
        hls_port: serverConfig.HLS_PORT
      }
    });
  });

  // Mount route modules
  try {
    const healthRoutes = createHealthRoutes(serverConfig, streamManager);
    const rtmpRoutes = createRtmpRoutes(serverConfig, streamManager);
    const streamRoutes = createStreamRoutes(serverConfig, streamManager);

    router.use('/', healthRoutes);
    router.use('/', rtmpRoutes);
    router.use('/', streamRoutes);
    
    console.log('✅ All API route modules mounted');
  } catch (error) {
    console.error('❌ Failed to mount API routes:', error);
    throw error;
  }

  return router;
}

function setupMiddleware(app, serverConfig) {
  console.log('🔧 Setting up API middleware...');
  setupCorsMiddleware(app);
  setupJsonMiddleware(app);
  setupLoggingMiddleware(app);
  setupStaticHlsMiddleware(app, serverConfig.mediaRoot);
  console.log('✅ API middleware configured');
}

module.exports = { createApiRoutes, setupMiddleware, setupErrorHandling };
