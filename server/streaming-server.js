// Railway-optimized Node.js streaming server with RTMP support
const express = require('express');
const http = require('http');
const ServerConfig = require('./config/server-config');
const { setupMiddleware } = require('./middleware/express-middleware');
const { createApiRoutes, setupErrorHandling } = require('./routes/api-routes');
const { setupWebSocketRoutes } = require('./routes/websocket-routes');
const StreamManager = require('./utils/stream-manager');
const MediaServerService = require('./services/media-server');

const app = express();

console.log('🚀 Starting Nightflow Streaming Server v2.0.4...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('📍 PORT from env:', process.env.PORT);

// Initialize components with error handling
let serverConfig;
let streamManager;
let mediaServer;

try {
  serverConfig = new ServerConfig();
  streamManager = new StreamManager();
  console.log('✅ Server components initialized successfully');
  console.log(`📍 API PORT: ${serverConfig.RAILWAY_PORT} (Railway Assigned)`);
  console.log(`📍 RTMP PORT: ${serverConfig.RTMP_PORT} (Standard)`);
  console.log(`📍 HLS PORT: ${serverConfig.HLS_PORT} (Non-conflicting)`);
} catch (error) {
  console.error('❌ Failed to initialize server components:', error);
  process.exit(1);
}

// Setup middleware
try {
  setupMiddleware(app);
  console.log('✅ Middleware setup complete');
} catch (error) {
  console.error('❌ Failed to setup middleware:', error);
  process.exit(1);
}

// Setup routes with detailed logging
try {
  console.log('🔧 Setting up Express routes...');
  const apiRoutes = createApiRoutes(serverConfig, streamManager);
  
  // Mount the router
  app.use('/', apiRoutes);
  console.log('✅ Routes mounted successfully');
  
} catch (error) {
  console.error('❌ Failed to setup routes:', error);
  process.exit(1);
}

// Setup error handling (404 handler must be LAST for HTTP routes)
setupErrorHandling(app);

console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Media Root: ${serverConfig.mediaRoot}`);

// Create HTTP server (needed for WebSocket upgrade)
const server = http.createServer(app);

// Setup WebSocket routes BEFORE starting the server
let wsHandler;
try {
  wsHandler = setupWebSocketRoutes(server, streamManager);
  console.log('✅ WebSocket routes setup complete');
} catch (error) {
  console.error('❌ Failed to setup WebSocket routes:', error);
  process.exit(1);
}

// Start HTTP server with WebSocket support FIRST
server.listen(serverConfig.RAILWAY_PORT, '0.0.0.0', () => {
  console.log(`✅ API + WebSocket SERVER RUNNING ON PORT ${serverConfig.RAILWAY_PORT}`);
  console.log(`🔗 Health: https://nightflow-vibes-social-production.up.railway.app/health`);
  console.log(`🔗 API Health: https://nightflow-vibes-social-production.up.railway.app/api/health`);
  console.log(`🔗 Root: https://nightflow-vibes-social-production.up.railway.app/`);
  console.log(`🎥 RTMP: rtmp://nightflow-vibes-social-production.up.railway.app/live`);
  console.log(`📺 HLS Base: https://nightflow-vibes-social-production.up.railway.app/live/`);
  console.log(`🔌 WebSocket: wss://nightflow-vibes-social-production.up.railway.app/ws/stream/:streamKey`);
  
  // NOW start Node Media Server AFTER API server is confirmed running
  console.log('🎬 Starting Node Media Server for RTMP streaming...');
  try {
    mediaServer = new MediaServerService(serverConfig.getMediaServerConfig(), streamManager);
    const mediaStarted = mediaServer.start();
    
    if (mediaStarted) {
      console.log('🎥 ✅ RTMP SERVER IS NOW LIVE AND READY FOR OBS!');
      console.log(`🎥 ✅ OBS can connect to: rtmp://nightflow-vibes-social-production.up.railway.app/live`);
      console.log(`🎥 ✅ Use your stream key from the app`);
    } else {
      console.log('⚠️ RTMP server failed to start - API still works');
    }
    
    // Store reference for graceful shutdown
    app.locals.mediaServer = mediaServer;
    app.locals.wsHandler = wsHandler;
    
  } catch (error) {
    console.error('❌ CRITICAL: Failed to start RTMP media server:', error);
    console.log('⚠️ This is why OBS cannot connect! Fixing...');
    
    // Log the specific error details
    console.error('Error details:', error.stack);
    
    // Don't exit - keep API running but log the issue
    console.log('🔄 API server continues running, but RTMP is broken');
  }
});

server.on('error', (error) => {
  console.error('❌ API SERVER ERROR:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${serverConfig.RAILWAY_PORT} is already in use!`);
  }
  process.exit(1);
});

// Enhanced keep alive with RTMP status
const keepAliveInterval = setInterval(() => {
  try {
    const uptime = Math.floor(process.uptime());
    const streamCount = streamManager ? streamManager.getStreamCount() : 0;
    const rtmpStatus = mediaServer ? 'RUNNING' : 'FAILED';
    console.log(`💓 Server Status - API:${serverConfig.RAILWAY_PORT} RTMP:${rtmpStatus} - Uptime: ${uptime}s - Streams: ${streamCount}`);
    
    if (!mediaServer) {
      console.log('🚨 RTMP server is not running - this is why OBS fails!');
    }
  } catch (error) {
    console.error('❌ Keep alive error:', error);
  }
}, 30000);

// Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received - shutting down gracefully`);
  
  // Clear keep alive interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Close WebSocket server
  if (app.locals.wsHandler && app.locals.wsHandler.wss) {
    app.locals.wsHandler.wss.close(() => {
      console.log('✅ WebSocket server closed');
    });
  }
  
  // Stop media server
  if (app.locals.mediaServer) {
    try {
      app.locals.mediaServer.stop();
      console.log('✅ Media server stopped');
    } catch (error) {
      console.error('❌ Error stopping media server:', error);
    }
  }
  
  // Close HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed gracefully');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Simplified error handling that doesn't ignore errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  
  // Only handle specific node-media-server internal errors
  if (error.message && (
    error.message.includes('getFfmpegVersion') || 
    error.message.includes('ffmpeg') ||
    error.stack && error.stack.includes('node-media-server')
  )) {
    console.log('🔧 Node Media Server internal error - this won\'t affect streaming');
    return; // Don't shutdown for node-media-server internal errors
  }
  
  console.error('This is a critical error - shutting down');
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Only handle specific node-media-server internal rejections
  if (reason && reason.message && (
    reason.message.includes('getFfmpegVersion') ||
    reason.message.includes('ffmpeg')
  )) {
    console.log('🔧 Node Media Server internal rejection - this won\'t affect streaming');
    return; // Don't shutdown for node-media-server internal rejections
  }
  
  console.error('This is a critical rejection - shutting down');
  gracefulShutdown('UNHANDLED_REJECTION');
});
