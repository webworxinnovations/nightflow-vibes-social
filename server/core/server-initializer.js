
const ServerConfig = require('../config/server-config');
const StreamManager = require('../utils/stream-manager');
const HTTPStreamServer = require('../services/http-stream-server');

class ServerInitializer {
  constructor() {
    this.serverConfig = null;
    this.streamManager = null;
    this.httpStreamServer = null;
  }

  async initialize() {
    console.log('🚀 Starting Nightflow Streaming Server v2.2.0...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📍 DigitalOcean Droplet IP: 67.205.179.77');
    console.log('📍 PORT from env:', process.env.PORT);

    try {
      this.serverConfig = new ServerConfig();
      this.streamManager = new StreamManager();
      
      // Initialize HTTP Stream Server
      this.httpStreamServer = new HTTPStreamServer(this.serverConfig, this.streamManager);
      
      console.log('✅ Server components initialized successfully');
      console.log(`📍 API PORT: ${this.serverConfig.DROPLET_PORT} (DigitalOcean Droplet)`);
      console.log(`📍 RTMP PORT: ${this.serverConfig.RTMP_PORT} (DigitalOcean Droplet)`);
      console.log(`📍 HLS PORT: ${this.serverConfig.HLS_PORT} (DigitalOcean Droplet)`);
      
      // DigitalOcean droplet configuration
      console.log('🌊 DigitalOcean droplet deployment - optimizing for platform...');
      console.log(`🌊 Droplet IP: 67.205.179.77`);
      console.log('🌐 HTTP Streaming: Primary method for DigitalOcean compatibility');
      
      return {
        serverConfig: this.serverConfig,
        streamManager: this.streamManager,
        httpStreamServer: this.httpStreamServer
      };
      
    } catch (error) {
      console.error('❌ Failed to initialize server components:', error);
      throw error;
    }
  }
}

module.exports = ServerInitializer;
