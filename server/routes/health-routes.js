
function createHealthRoutes(serverConfig, streamManager) {
  const express = require('express');
  const router = express.Router();

  // Main health check endpoint - DROPLET ONLY
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
        api: serverConfig.DROPLET_PORT,
        rtmp: serverConfig.RTMP_PORT,
        hls: serverConfig.HLS_PORT
      },
      digitalocean: {
        droplet_ip: '67.205.179.77',
        environment: process.env.NODE_ENV || 'production',
        rtmp_url: `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`,
        hls_url: `http://67.205.179.77:${serverConfig.HLS_PORT}/live`
      }
    });
  });

  // API health endpoint
  router.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      streaming_server: 'online',
      rtmp_ready: true,
      rtmp_port: serverConfig.RTMP_PORT,
      rtmp_url: `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`,
      hls_ready: true,
      websocket_ready: true,
      droplet_ip: '67.205.179.77'
    });
  });

  return router;
}

module.exports = { createHealthRoutes };
