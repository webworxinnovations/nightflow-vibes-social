
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

  // Root endpoint
  router.get('/', (req, res) => {
    res.json({
      message: 'Nightflow Streaming Server - DigitalOcean Droplet',
      version: '2.0.4',
      droplet_ip: '67.205.179.77',
      endpoints: {
        health: '/health',
        api: '/api/*',
        websocket: '/ws/stream/:streamKey',
        rtmp: `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`,
        hls: '/live/:streamKey/index.m3u8'
      }
    });
  });

  // Mount route modules
  const healthRoutes = createHealthRoutes(serverConfig, streamManager);
  const rtmpRoutes = createRtmpRoutes(serverConfig, streamManager);
  const streamRoutes = createStreamRoutes(serverConfig, streamManager);

  router.use('/', healthRoutes);
  router.use('/', rtmpRoutes);
  router.use('/', streamRoutes);

  return router;
}

function setupMiddleware(app, serverConfig) {
  setupCorsMiddleware(app);
  setupJsonMiddleware(app);
  setupLoggingMiddleware(app);
  setupStaticHlsMiddleware(app, serverConfig.mediaRoot);
}

module.exports = { createApiRoutes, setupMiddleware, setupErrorHandling };
