
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
  }

  async initialize() {
    console.log('🚀 Starting Nightflow Streaming Server v2.0.4...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📍 PORT from env:', process.env.PORT);

    try {
      this.serverConfig = new ServerConfig();
      this.streamManager = new StreamManager();
      console.log('✅ Server components initialized successfully');
      console.log(`📍 API PORT: ${this.serverConfig.RAILWAY_PORT} (Railway Assigned)`);
      console.log(`📍 RTMP PORT: ${this.serverConfig.RTMP_PORT} (Standard)`);
      console.log(`📍 HLS PORT: ${this.serverConfig.HLS_PORT} (Non-conflicting)`);
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
  }

  async startServer(app) {
    this.server = http.createServer(app);

    try {
      this.wsHandler = setupWebSocketRoutes(this.server, this.streamManager);
      console.log('✅ WebSocket routes setup complete');
    } catch (error) {
      console.error('❌ Failed to setup WebSocket routes:', error);
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      this.server.listen(this.serverConfig.RAILWAY_PORT, '0.0.0.0', () => {
        console.log(`✅ API + WebSocket SERVER RUNNING ON PORT ${this.serverConfig.RAILWAY_PORT}`);
        console.log(`🔗 Health: https://nightflow-vibes-social-production.up.railway.app/health`);
        console.log(`🔗 API Health: https://nightflow-vibes-social-production.up.railway.app/api/health`);
        console.log(`🔗 Root: https://nightflow-vibes-social-production.up.railway.app/`);
        console.log(`🎥 RTMP: rtmp://nightflow-vibes-social-production.up.railway.app/live`);
        console.log(`📺 HLS Base: https://nightflow-vibes-social-production.up.railway.app/live/`);
        console.log(`🔌 WebSocket: wss://nightflow-vibes-social-production.up.railway.app/ws/stream/:streamKey`);
        
        this.startMediaServer(app);
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

  startMediaServer(app) {
    console.log('🎬 Starting Node Media Server for RTMP streaming...');
    try {
      this.mediaServer = new MediaServerService(this.serverConfig.getMediaServerConfig(), this.streamManager);
      const mediaStarted = this.mediaServer.start();
      
      if (mediaStarted) {
        console.log('🎥 ✅ RTMP SERVER IS NOW LIVE AND READY FOR OBS!');
        console.log(`🎥 ✅ OBS can connect to: rtmp://nightflow-vibes-social-production.up.railway.app/live`);
        console.log(`🎥 ✅ Use your stream key from the app`);
      } else {
        console.log('⚠️ RTMP server failed to start - API still works');
      }
      
      app.locals.mediaServer = this.mediaServer;
      app.locals.wsHandler = this.wsHandler;
      
    } catch (error) {
      console.error('❌ CRITICAL: Failed to start RTMP media server:', error);
      console.log('⚠️ This is why OBS cannot connect! Fixing...');
      console.error('Error details:', error.stack);
      console.log('🔄 API server continues running, but RTMP is broken');
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
