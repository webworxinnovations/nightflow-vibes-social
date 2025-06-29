
function createRtmpRoutes(serverConfig, streamManager) {
  const express = require('express');
  const router = express.Router();

  // RTMP status endpoint with DigitalOcean droplet info
  router.get('/api/rtmp/status', (req, res) => {
    res.json({
      status: 'online',
      port: serverConfig.RTMP_PORT,
      ready: true,
      url: `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`,
      active_streams: streamManager.getStreamCount(),
      uptime: Math.floor(process.uptime()),
      droplet: {
        ip: '67.205.179.77',
        rtmp_port: serverConfig.RTMP_PORT,
        hls_port: serverConfig.HLS_PORT
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

    // DigitalOcean droplet RTMP URL
    const rtmpUrl = `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`;
    
    res.json({
      success: true,
      message: 'RTMP server is ready on DigitalOcean droplet',
      rtmp_url: rtmpUrl,
      stream_key: streamKey,
      full_rtmp_url: `${rtmpUrl}/${streamKey}`,
      status: 'ready',
      droplet_ip: '67.205.179.77',
      instructions: [
        'Copy the RTMP URL to OBS Settings → Stream → Server',
        'Copy the Stream Key to OBS Settings → Stream → Stream Key',
        'Click Start Streaming in OBS'
      ]
    });
  });

  return router;
}

module.exports = { createRtmpRoutes };
