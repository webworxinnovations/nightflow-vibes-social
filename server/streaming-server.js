// Railway-optimized Node.js streaming server with RTMP support
const express = require('express');
const ServerConfig = require('./config/server-config');
const { setupMiddleware } = require('./middleware/express-middleware');
const { createApiRoutes, setupErrorHandling } = require('./routes/api-routes');
const StreamManager = require('./utils/stream-manager');
const MediaServerService = require('./services/media-server');

const app = express();

// Initialize components
const serverConfig = new ServerConfig();
const streamManager = new StreamManager();

// Setup middleware
setupMiddleware(app);

// Setup routes
app.use('/', createApiRoutes(serverConfig, streamManager));

// Setup error handling
setupErrorHandling(app);

console.log('🚀 Starting Nightflow Streaming Server v2.0.2...');
console.log(`📍 API PORT: ${serverConfig.RAILWAY_PORT} (Railway Assigned)`);
console.log(`📍 RTMP PORT: ${serverConfig.RTMP_PORT} (Standard)`);
console.log(`📍 HLS PORT: ${serverConfig.HLS_PORT} (Non-conflicting)`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Media Root: ${serverConfig.mediaRoot}`);

// Start Express server FIRST on Railway's assigned port
const server = app.listen(serverConfig.RAILWAY_PORT, () => {
  console.log(`✅ API SERVER RUNNING ON PORT ${serverConfig.RAILWAY_PORT}`);
  console.log(`🔗 Health: https://nodejs-production-aa37f.up.railway.app/health`);
  console.log(`🎥 RTMP: rtmp://nodejs-production-aa37f.up.railway.app/live`);
  console.log(`📺 HLS Base: https://nodejs-production-aa37f.up.railway.app/live/`);
  
  // Start Node Media Server AFTER API server is running
  const mediaServer = new MediaServerService(serverConfig.getMediaServerConfig(), streamManager);
  mediaServer.start();
  
  // Store reference for graceful shutdown
  app.locals.mediaServer = mediaServer;
});

server.on('error', (error) => {
  console.error('❌ API SERVER ERROR:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${serverConfig.RAILWAY_PORT} is already in use!`);
  }
  process.exit(1);
});

// Keep alive ping with detailed port info
setInterval(() => {
  console.log(`💓 Server alive - API:${serverConfig.RAILWAY_PORT} RTMP:${serverConfig.RTMP_PORT} HLS:${serverConfig.HLS_PORT} - Uptime: ${Math.floor(process.uptime())}s - Streams: ${streamManager.getStreamCount()}`);
}, 30000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received - shutting down gracefully');
  if (app.locals.mediaServer) {
    app.locals.mediaServer.stop();
  }
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received - shutting down gracefully');
  if (app.locals.mediaServer) {
    app.locals.mediaServer.stop();
  }
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});
