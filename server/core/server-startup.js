
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
    this.rtmpReady = false;
  }

  async initialize() {
    console.log('🚀 Starting Nightflow Streaming Server v2.2.0...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📍 DigitalOcean Environment:', process.env.DIGITALOCEAN_APP_URL || 'none');
    console.log('📍 PORT from env:', process.env.PORT);

    try {
      this.serverConfig = new ServerConfig();
      this.streamManager = new StreamManager();
      
      // Initialize HTTP Stream Server
      this.httpStreamServer = new HTTPStreamServer(this.serverConfig, this.streamManager);
      
      console.log('✅ Server components initialized successfully');
      console.log(`📍 API PORT: ${this.serverConfig.RAILWAY_PORT} (DigitalOcean Assigned)`);
      console.log(`📍 RTMP PORT: ${this.serverConfig.RTMP_PORT} (DigitalOcean Compatible)`);
      console.log(`📍 HTTP STREAMING: Available (DigitalOcean Compatible)`);
      
      // DigitalOcean-specific configuration
      if (process.env.DIGITALOCEAN_APP_URL) {
        console.log('🌊 DigitalOcean deployment detected - optimizing for platform...');
        console.log(`🌊 App URL: ${process.env.DIGITALOCEAN_APP_URL}`);
        console.log('🌐 HTTP Streaming: Primary method for DigitalOcean compatibility');
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
    
    // Enhanced health check endpoint for DigitalOcean
    app.get('/health', (req, res) => {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'nightflow-streaming-server',
        version: '2.2.0',
        uptime: Math.floor(process.uptime()),
        digitalocean: {
          app_url: process.env.DIGITALOCEAN_APP_URL || 'unknown',
          environment: process.env.NODE_ENV || 'development'
        },
        streaming: {
          rtmp: {
            configured: true,
            port: this.serverConfig.RTMP_PORT,
            ready: this.rtmpReady,
            status: this.rtmpReady ? 'ready' : 'initializing'
          },
          http: {
            configured: true,
            available: true,
            status: 'ready'
          },
          api: {
            ready: true,
            status: 'operational'
          }
        }
      };
      res.json(healthData);
    });

    // API health endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        rtmp_ready: this.rtmpReady,
        api_ready: true,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
      });
    });
  }

  async startServer(app) {
    this.server = http.createServer(app);

    // Configure server timeouts for DigitalOcean
    this.server.timeout = 60000;
    this.server.keepAliveTimeout = 65000;
    this.server.headersTimeout = 66000;

    try {
      this.wsHandler = setupWebSocketRoutes(this.server, this.streamManager);
      console.log('✅ WebSocket routes setup complete');
    } catch (error) {
      console.error('❌ Failed to setup WebSocket routes:', error);
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      this.setupDigitalOceanSignalHandlers();
      
      this.server.listen(this.serverConfig.RAILWAY_PORT, '0.0.0.0', () => {
        console.log(`✅ API + WebSocket SERVER RUNNING ON PORT ${this.serverConfig.RAILWAY_PORT}`);
        console.log(`🔗 Health: https://nightflow-app-wijb2.ondigitalocean.app/health`);
        console.log(`🔗 API Health: https://nightflow-app-wijb2.ondigitalocean.app/api/health`);
        console.log(`🔗 Root: https://nightflow-app-wijb2.ondigitalocean.app/`);
        
        // DigitalOcean streaming URLs
        console.log(`🎥 RTMP: rtmp://nightflow-app-wijb2.ondigitalocean.app:${this.serverConfig.RTMP_PORT}/live`);
        console.log(`📺 HLS: https://nightflow-app-wijb2.ondigitalocean.app/live/`);
        console.log(`🔌 WebSocket: wss://nightflow-app-wijb2.ondigitalocean.app/ws/stream/:streamKey`);
        
        // Start media server after API is ready
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

  setupDigitalOceanSignalHandlers() {
    // DigitalOcean sends SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log('🌊 DigitalOcean SIGTERM received - graceful shutdown initiated...');
      this.gracefulShutdown('DIGITALOCEAN_SIGTERM');
    });

    process.on('SIGINT', () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log('🌊 DigitalOcean SIGINT received - graceful shutdown initiated...');
      this.gracefulShutdown('DIGITALOCEAN_SIGINT');
    });
  }

  gracefulShutdown(signal) {
    console.log(`🌊 ${signal} - Starting graceful shutdown sequence...`);
    
    if (this.server) {
      this.server.close(() => {
        console.log('✅ HTTP server closed gracefully');
      });
    }
    
    if (this.wsHandler && this.wsHandler.wss) {
      this.wsHandler.wss.close(() => {
        console.log('✅ WebSocket server closed gracefully');
      });
    }
    
    if (this.mediaServer) {
      try {
        console.log('🎬 Stopping RTMP media server...');
        this.mediaServer.stop();
        console.log('✅ RTMP media server stopped gracefully');
      } catch (error) {
        console.error('❌ Error stopping media server:', error);
      }
    }
    
    setTimeout(() => {
      console.log('🌊 DigitalOcean graceful shutdown complete');
      process.exit(0);
    }, 3000);
  }

  startMediaServerSafely(app) {
    console.log('🎬 Starting Media Servers (RTMP + HTTP Streaming)...');
    
    try {
      // Start RTMP server with DigitalOcean optimizations
      setTimeout(async () => {
        this.mediaServer = new MediaServerService(this.serverConfig, this.streamManager);
        
        try {
          const mediaStarted = await this.mediaServer.start();
          
          if (mediaStarted) {
            this.rtmpReady = true;
            console.log('🎥 ✅ RTMP server started successfully on DigitalOcean!');
            console.log(`🎯 ✅ OBS Connection: rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live`);
            console.log('📱 ✅ HLS streams: https://nightflow-app-wijb2.ondigitalocean.app/live/STREAM_KEY/index.m3u8');
            console.log('🌊 ✅ DigitalOcean streaming infrastructure fully operational');
          } else {
            console.log('⚠️ RTMP server startup issues - using HTTP streaming as fallback');
            console.log('🌐 HTTP streaming provides full functionality on DigitalOcean');
          }
          
        } catch (error) {
          console.error('❌ RTMP startup error:', error);
          console.log('🌐 HTTP streaming continues - DigitalOcean compatible solution active');
        }
        
        console.log('🌐 ✅ HTTP STREAMING SERVER READY!');
        console.log('🌐 ✅ Browser streaming: Fully functional on DigitalOcean');
        console.log('🌐 ✅ WebRTC streaming: Available for compatible software');
        
        app.locals.mediaServer = this.mediaServer;
        app.locals.httpStreamServer = this.httpStreamServer;
        app.locals.wsHandler = this.wsHandler;
        
      }, 3000); // 3 second delay for DigitalOcean stability
      
    } catch (error) {
      console.error('❌ Media server startup error:', error);
      console.log('🌐 HTTP streaming continues - DigitalOcean compatible solution active');
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
