
function createStreamRoutes(serverConfig, streamManager) {
  const express = require('express');
  const router = express.Router();

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

module.exports = { createStreamRoutes };
