
const http = require('http');
const ServerConfig = require('../config/server-config');
const { setupMiddleware } = require('../middleware/express-middleware');
const { createApiRoutes, setupErrorHandling } = require('../routes/api-routes');
const { setupWebSocketRoutes } = require('../routes/websocket-routes');
const StreamManager = require('../utils/stream-manager');
const MediaServerService = require('../services/media-server');

class ServerStartup {
  constructor() {
    this.serverConfig = null;
    this.streamManager = null;
    this.mediaServer = null;
    this.server = null;
    this.wsHandler = null;
    this.isShuttingDown = false;
  }

  async initialize() {
    console.log('🚀 Starting Nightflow Streaming Server v2.0.5...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📍 Railway Environment:', process.env.RAILWAY_ENVIRONMENT || 'none');
    console.log('📍 PORT from env:', process.env.PORT);

    try {
      this.serverConfig = new ServerConfig();
      this.streamManager = new StreamManager();
      console.log('✅ Server components initialized successfully');
      console.log(`📍 API PORT: ${this.serverConfig.RAILWAY_PORT} (Railway Assigned)`);
      console.log(`📍 RTMP PORT: ${this.serverConfig.RTMP_PORT} (Standard)`);
      console.log(`📍 HLS PORT: ${this.serverConfig.HLS_PORT} (Non-conflicting)`);
      
      // Railway-specific configuration
      if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('🚄 Railway deployment detected - configuring for cloud streaming...');
        console.log(`🚄 Railway Service: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize server components:', error);
      process.exit(1);
    }
  }

  setupExpress(app) {
    try {
      setupMiddleware(app);
      console.log('✅ Middleware setup complete');
    } catch (error) {
      console.error('❌ Failed to setup middleware:', error);
      process.exit(1);
    }

    try {
      console.log('🔧 Setting up Express routes...');
      const apiRoutes = createApiRoutes(this.serverConfig, this.streamManager);
      app.use('/', apiRoutes);
      console.log('✅ Routes mounted successfully');
    } catch (error) {
      console.error('❌ Failed to setup routes:', error);
      process.exit(1);
    }

    setupErrorHandling(app);
    
    // Add Railway-specific health check endpoint
    app.get('/railway-health', (req, res) => {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'nightflow-streaming-server',
        version: '2.0.5',
        uptime: Math.floor(process.uptime()),
        railway: {
          environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
          service_id: process.env.RAILWAY_SERVICE_ID || 'unknown'
        },
        rtmp: {
          configured: true,
          port: this.serverConfig.RTMP_PORT,
          status: this.mediaServer ? 'running' : 'starting'
        }
      };
      res.json(healthData);
    });
  }

  async startServer(app) {
    this.server = http.createServer(app);

    // Configure server timeouts for Railway
    this.server.timeout = 60000; // 60 seconds
    this.server.keepAliveTimeout = 65000; // Slightly longer than timeout
    this.server.headersTimeout = 66000; // Slightly longer than keepAliveTimeout

    try {
      this.wsHandler = setupWebSocketRoutes(this.server, this.streamManager);
      console.log('✅ WebSocket routes setup complete');
    } catch (error) {
      console.error('❌ Failed to setup WebSocket routes:', error);
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      // Handle Railway's graceful shutdown signals
      this.setupRailwaySignalHandlers();
      
      this.server.listen(this.serverConfig.RAILWAY_PORT, '0.0.0.0', () => {
        console.log(`✅ API + WebSocket SERVER RUNNING ON PORT ${this.serverConfig.RAILWAY_PORT}`);
        console.log(`🔗 Health: https://nightflow-vibes-social-production.up.railway.app/health`);
        console.log(`🔗 Railway Health: https://nightflow-vibes-social-production.up.railway.app/railway-health`);
        console.log(`🔗 API Health: https://nightflow-vibes-social-production.up.railway.app/api/health`);
        console.log(`🔗 Root: https://nightflow-vibes-social-production.up.railway.app/`);
        
        // Railway RTMP configuration
        if (process.env.RAILWAY_ENVIRONMENT) {
          console.log(`🎥 RTMP (Railway): rtmp://nightflow-vibes-social-production.up.railway.app:${this.serverConfig.RTMP_PORT}/live`);
          console.log(`📺 HLS (Railway): https://nightflow-vibes-social-production.up.railway.app/live/`);
          console.log(`🔌 WebSocket (Railway): wss://nightflow-vibes-social-production.up.railway.app/ws/stream/:streamKey`);
        } else {
          console.log(`🎥 RTMP (Local): rtmp://localhost:${this.serverConfig.RTMP_PORT}/live`);
          console.log(`📺 HLS (Local): http://localhost:${this.serverConfig.HLS_PORT}/live/`);
        }
        
        // Start media server with Railway-aware configuration
        this.startMediaServerSafely(app);
        resolve(this.server);
      });

      this.server.on('error', (error) => {
        console.error('❌ API SERVER ERROR:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${this.serverConfig.RAILWAY_PORT} is already in use!`);
        }
        reject(error);
      });
    });
  }

  setupRailwaySignalHandlers() {
    // Railway sends SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log('🚄 Railway SIGTERM received - graceful shutdown initiated...');
      this.gracefulShutdown('RAILWAY_SIGTERM');
    });

    process.on('SIGINT', () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log('🚄 Railway SIGINT received - graceful shutdown initiated...');
      this.gracefulShutdown('RAILWAY_SIGINT');
    });
  }

  gracefulShutdown(signal) {
    console.log(`🚄 ${signal} - Starting graceful shutdown sequence...`);
    
    // Stop accepting new connections
    if (this.server) {
      this.server.close(() => {
        console.log('✅ HTTP server closed gracefully');
      });
    }
    
    // Close WebSocket connections
    if (this.wsHandler && this.wsHandler.wss) {
      this.wsHandler.wss.close(() => {
        console.log('✅ WebSocket server closed gracefully');
      });
    }
    
    // Stop media server
    if (this.mediaServer) {
      try {
        console.log('🎬 Stopping RTMP media server...');
        this.mediaServer.stop();
        console.log('✅ RTMP media server stopped gracefully');
      } catch (error) {
        console.error('❌ Error stopping media server:', error);
      }
    }
    
    // Exit after cleanup
    setTimeout(() => {
      console.log('🚄 Railway graceful shutdown complete');
      process.exit(0);
    }, 3000);
  }

  startMediaServerSafely(app) {
    console.log('🎬 Starting RTMP Media Server (Railway-optimized)...');
    
    try {
      // Add delay for Railway deployment stability
      setTimeout(() => {
        this.mediaServer = new MediaServerService(this.serverConfig, this.streamManager);
        const mediaStarted = this.mediaServer.start();
        
        if (mediaStarted) {
          console.log('🎥 ✅ RTMP SERVER STARTED SUCCESSFULLY ON RAILWAY!');
          console.log(`🎥 ✅ OBS Connection: rtmp://nightflow-vibes-social-production.up.railway.app:${this.serverConfig.RTMP_PORT}/live`);
          console.log(`🎥 ✅ Stream Key: Use your generated stream key`);
          console.log('🚄 ✅ Railway RTMP streaming is now operational!');
        } else {
          console.log('⚠️ RTMP server failed to start - API continues running');
          console.log('🚄 This may be due to Railway port configuration limitations');
        }
        
        app.locals.mediaServer = this.mediaServer;
        app.locals.wsHandler = this.wsHandler;
        
      }, 2000); // 2 second delay for Railway stability
      
    } catch (error) {
      console.error('❌ CRITICAL: Railway RTMP server startup failed:', error);
      console.log('🚄 This is expected if Railway doesn\'t support custom TCP ports');
      console.log('🔄 API server continues - consider HTTP-based streaming alternatives');
    }
  }

  getServerConfig() {
    return this.serverConfig;
  }

  getStreamManager() {
    return this.streamManager;
  }
}

module.exports = ServerStartup;
