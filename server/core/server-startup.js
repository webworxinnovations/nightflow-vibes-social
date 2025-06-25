const http = require('http');
const ServerConfig = require('../config/server-config');
const { setupMiddleware } = require('../middleware/express-middleware');
const { createApiRoutes, setupErrorHandling } = require('../routes/api-routes');
const { setupWebSocketRoutes } = require('../routes/websocket-routes');
const StreamManager = require('../utils/stream-manager');
const MediaServerService = require('../services/media-server');
const HTTPStreamServer = require('../services/http-stream-server');

class ServerStartup {
  constructor() {
    this.serverConfig = null;
    this.streamManager = null;
    this.mediaServer = null;
    this.httpStreamServer = null;
    this.server = null;
    this.wsHandler = null;
    this.isShuttingDown = false;
  }

  async initialize() {
    console.log('🚀 Starting Nightflow Streaming Server v2.1.0...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📍 Railway Environment:', process.env.RAILWAY_ENVIRONMENT || 'none');
    console.log('📍 PORT from env:', process.env.PORT);

    try {
      this.serverConfig = new ServerConfig();
      this.streamManager = new StreamManager();
      
      // Initialize HTTP Stream Server (Railway RTMP alternative)
      this.httpStreamServer = new HTTPStreamServer(this.serverConfig, this.streamManager);
      
      console.log('✅ Server components initialized successfully');
      console.log(`📍 API PORT: ${this.serverConfig.RAILWAY_PORT} (Railway Assigned)`);
      console.log(`📍 RTMP PORT: ${this.serverConfig.RTMP_PORT} (Limited on Railway)`);
      console.log(`📍 HTTP STREAMING: Available (Railway Compatible)`);
      
      // Railway-specific configuration
      if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('🚄 Railway deployment detected - HTTP streaming enabled...');
        console.log(`🚄 Railway Service: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`);
        console.log('🌐 HTTP Streaming: Bypasses Railway RTMP port limitations');
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
      
      // Add HTTP streaming routes
      app.use('/api', this.httpStreamServer.getRouter());
      console.log('🌐 HTTP streaming routes mounted');
      
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
        version: '2.1.0',
        uptime: Math.floor(process.uptime()),
        railway: {
          environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
          service_id: process.env.RAILWAY_SERVICE_ID || 'unknown'
        },
        streaming: {
          rtmp: {
            configured: true,
            port: this.serverConfig.RTMP_PORT,
            external_access: false,
            status: 'limited_by_railway'
          },
          http: {
            configured: true,
            available: true,
            status: 'fully_functional'
          }
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
    console.log('🎬 Starting Media Servers (RTMP + HTTP Streaming)...');
    
    try {
      // Add delay for Railway deployment stability
      setTimeout(() => {
        // Start RTMP server (limited external access on Railway)
        this.mediaServer = new MediaServerService(this.serverConfig, this.streamManager);
        const mediaStarted = this.mediaServer.start();
        
        console.log('🌐 ✅ HTTP STREAMING SERVER READY!');
        console.log('🌐 ✅ Browser streaming: Fully functional on Railway');
        console.log('🌐 ✅ WebRTC streaming: Available for compatible software');
        
        if (mediaStarted) {
          console.log('🎥 ⚠️ RTMP server started internally (limited external access)');
          console.log(`🎥 ⚠️ OBS Connection: Limited due to Railway port 1935 restrictions`);
          console.log('💡 ✅ Use Browser Streaming for full Railway compatibility!');
        } else {
          console.log('⚠️ RTMP server failed - using HTTP streaming only');
          console.log('🌐 HTTP streaming provides full functionality on Railway');
        }
        
        app.locals.mediaServer = this.mediaServer;
        app.locals.httpStreamServer = this.httpStreamServer;
        app.locals.wsHandler = this.wsHandler;
        
      }, 2000); // 2 second delay for Railway stability
      
    } catch (error) {
      console.error('❌ Media server startup error:', error);
      console.log('🌐 HTTP streaming continues - Railway compatible solution active');
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
