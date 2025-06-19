
// Railway-optimized Node.js streaming server with RTMP support
const express = require('express');
const ServerConfig = require('./config/server-config');
const { setupMiddleware } = require('./middleware/express-middleware');
const { createApiRoutes, setupErrorHandling } = require('./routes/api-routes');
const StreamManager = require('./utils/stream-manager');
const MediaServerService = require('./services/media-server');

const app = express();

console.log('🚀 Starting Nightflow Streaming Server v2.0.2...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('📍 PORT from env:', process.env.PORT);

// Initialize components with error handling
let serverConfig;
let streamManager;

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
  const apiRoutes = createApiRoutes(serverConfig, streamManager);
  app.use('/', apiRoutes);
  console.log('✅ Routes setup complete');
  
  // Log all registered routes for debugging
  console.log('📋 Registered routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`   ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`   ${Object.keys(handler.route.methods)} ${handler.route.path}`);
        }
      });
    }
  });
} catch (error) {
  console.error('❌ Failed to setup routes:', error);
  process.exit(1);
}

// Setup error handling
setupErrorHandling(app);

console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Media Root: ${serverConfig.mediaRoot}`);

// Start Express server FIRST on Railway's assigned port
const server = app.listen(serverConfig.RAILWAY_PORT, '0.0.0.0', () => {
  console.log(`✅ API SERVER RUNNING ON PORT ${serverConfig.RAILWAY_PORT}`);
  console.log(`🔗 Health: https://nightflow-vibes-social-production.up.railway.app/health`);
  console.log(`🔗 API Health: https://nightflow-vibes-social-production.up.railway.app/api/health`);
  console.log(`🔗 Root: https://nightflow-vibes-social-production.up.railway.app/`);
  console.log(`🎥 RTMP: rtmp://nightflow-vibes-social-production.up.railway.app/live`);
  console.log(`📺 HLS Base: https://nightflow-vibes-social-production.up.railway.app/live/`);
  
  // Test internal route registration
  console.log('🧪 Testing internal route access...');
  
  // Start Node Media Server AFTER API server is running
  try {
    const mediaServer = new MediaServerService(serverConfig.getMediaServerConfig(), streamManager);
    mediaServer.start();
    
    // Store reference for graceful shutdown
    app.locals.mediaServer = mediaServer;
    console.log('✅ Media server started successfully');
  } catch (error) {
    console.error('❌ Failed to start media server:', error);
    // Don't exit here - the API server can still work without media server
  }
});

server.on('error', (error) => {
  console.error('❌ API SERVER ERROR:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${serverConfig.RAILWAY_PORT} is already in use!`);
  }
  process.exit(1);
});

// Improved keep alive with error handling
const keepAliveInterval = setInterval(() => {
  try {
    const uptime = Math.floor(process.uptime());
    const streamCount = streamManager ? streamManager.getStreamCount() : 0;
    console.log(`💓 Server alive - API:${serverConfig.RAILWAY_PORT} RTMP:${serverConfig.RTMP_PORT} HLS:${serverConfig.HLS_PORT} - Uptime: ${uptime}s - Streams: ${streamCount}`);
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
