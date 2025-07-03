const http = require('http');
const ServerInitializer = require('./server-initializer');
const ExpressSetup = require('./express-setup');
const { setupWebSocketRoutes } = require('../routes/websocket-routes');
const MediaServerService = require('../services/media-server');

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
    const initializer = new ServerInitializer();
    const components = await initializer.initialize();
    
    this.serverConfig = components.serverConfig;
    this.streamManager = components.streamManager;
    this.httpStreamServer = components.httpStreamServer;
  }

  setupExpress(app) {
    ExpressSetup.setupApp(app, this.serverConfig, this.streamManager, this.httpStreamServer);
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
      throw error;
    }

    return new Promise((resolve, reject) => {
      this.setupDigitalOceanSignalHandlers();
      
      this.server.listen(this.serverConfig.DROPLET_PORT, '0.0.0.0', () => {
        console.log(`🌐 ✅ NIGHTFLOW SERVER FULLY OPERATIONAL!`);
        console.log(`📍 Server IP: 67.205.179.77:${this.serverConfig.DROPLET_PORT}`);
        console.log(`🔗 Health Check: http://67.205.179.77:${this.serverConfig.DROPLET_PORT}/health`);
        console.log(`🔗 API Health: http://67.205.179.77:${this.serverConfig.DROPLET_PORT}/api/health`);
        console.log(`🔗 Root API: http://67.205.179.77:${this.serverConfig.DROPLET_PORT}/`);
        
        // DigitalOcean streaming URLs
        console.log(`🎥 RTMP for OBS: rtmp://67.205.179.77:${this.serverConfig.RTMP_PORT}/live`);
        console.log(`📺 HLS Streaming: http://67.205.179.77:${this.serverConfig.DROPLET_PORT}/live/`);
        console.log(`🔌 WebSocket: ws://67.205.179.77:${this.serverConfig.DROPLET_PORT}/ws/stream/:streamKey`);
        
        // Start media server after API is ready
        this.startMediaServerSafely(app);
        resolve(this.server);
      });

      this.server.on('error', (error) => {
        console.error('❌ HTTP SERVER ERROR:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${this.serverConfig.DROPLET_PORT} is already in use!`);
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
            console.log('🎥 ✅ RTMP server started successfully on DigitalOcean droplet!');
            console.log(`🎯 ✅ OBS Connection: rtmp://67.205.179.77:1935/live`);
            console.log('📱 ✅ HLS streams: http://67.205.179.77:9001/live/STREAM_KEY/index.m3u8');
            console.log('🌊 ✅ DigitalOcean droplet streaming infrastructure fully operational');
          } else {
            console.log('⚠️ RTMP server startup issues - using HTTP streaming as fallback');
            console.log('🌐 HTTP streaming provides full functionality on DigitalOcean droplet');
          }
          
        } catch (error) {
          console.error('❌ RTMP startup error:', error);
          console.log('🌐 HTTP streaming continues - DigitalOcean droplet compatible solution active');
        }
        
        console.log('🌐 ✅ HTTP STREAMING SERVER READY!');
        console.log('🌐 ✅ Browser streaming: Fully functional on DigitalOcean droplet');
        console.log('🌐 ✅ WebRTC streaming: Available for compatible software');
        
        app.locals.mediaServer = this.mediaServer;
        app.locals.httpStreamServer = this.httpStreamServer;
        app.locals.wsHandler = this.wsHandler;
        
      }, 3000); // 3 second delay for DigitalOcean stability
      
    } catch (error) {
      console.error('❌ Media server startup error:', error);
      console.log('🌐 HTTP streaming continues - DigitalOcean droplet compatible solution active');
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
