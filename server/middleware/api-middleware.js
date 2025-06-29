
const express = require('express');
const path = require('path');

function setupCorsMiddleware(app) {
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
}

function setupJsonMiddleware(app) {
  app.use(express.json());
}

function setupLoggingMiddleware(app) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

function setupStaticHlsMiddleware(app, mediaRoot) {
  app.use('/live', express.static(path.join(mediaRoot, 'live'), {
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
}

function setupErrorHandling(app) {
  // 404 handler for unmatched routes
  app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      error: 'Route not found',
      method: req.method,
      path: req.originalUrl,
      droplet_ip: '67.205.179.77',
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
      message: err.message,
      droplet_ip: '67.205.179.77'
    });
  });
}

module.exports = {
  setupCorsMiddleware,
  setupJsonMiddleware,
  setupLoggingMiddleware,
  setupStaticHlsMiddleware,
  setupErrorHandling
};
