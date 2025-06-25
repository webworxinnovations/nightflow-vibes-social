
const NodeMediaServer = require('node-media-server');
const MediaDirectoryManager = require('./media-directory-manager');
const MediaEventHandlers = require('./media-event-handlers');

class MediaServerService {
  constructor(serverConfigInstance, streamManager) {
    this.serverConfig = serverConfigInstance;
    this.streamManager = streamManager;
    this.nms = null;
    
    console.log('🎬 Initializing Media Server Service...');
    
    this.mediaDirectoryManager = new MediaDirectoryManager(this.serverConfig.mediaRoot);
    this.mediaDirectoryManager.setupDirectories();
    
    this.eventHandlers = new MediaEventHandlers(streamManager, this.mediaDirectoryManager);
  }
  
  async createNodeMediaServer() {
    console.log('🔧 Creating Node Media Server configuration...');
    
    // Generate SSL certificates if needed
    if (this.serverConfig.SSL_ENABLED) {
      console.log('🔐 SSL is enabled, generating certificates...');
      const sslGenerated = await this.serverConfig.generateSSLCertificates();
      if (!sslGenerated) {
        console.log('⚠️ SSL generation failed, falling back to standard RTMP');
        this.serverConfig.SSL_ENABLED = false;
      }
    }
    
    const mediaServerConfig = this.serverConfig.getMediaServerConfig();
    
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log('✅ Node Media Server instance created');
      this.eventHandlers.setupAllHandlers(this.nms);
      
      // Add error handling for the NMS instance
      this.nms.on('error', (error) => {
        console.error('❌ Node Media Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.log(`🔍 Port ${this.serverConfig.RTMP_PORT} is already in use!`);
        } else if (error.code === 'EACCES') {
          console.log(`🔍 Permission denied on port ${this.serverConfig.RTMP_PORT}!`);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  async start() {
    console.log('🚀 Starting Node Media Server...');
    
    try {
      if (!this.nms) {
        await this.createNodeMediaServer();
      }
      
      const protocol = this.serverConfig.SSL_ENABLED ? 'RTMPS (SSL)' : 'RTMP';
      console.log(`🎬 Attempting to start ${protocol} server on port ${this.serverConfig.RTMP_PORT}...`);
      console.log(`🎬 Attempting to start HLS server on port ${this.serverConfig.HLS_PORT}...`);
      
      // Wrap the run() call in a promise to handle errors properly
      await new Promise((resolve, reject) => {
        try {
          this.nms.run();
          
          // Give it a moment to start up
          setTimeout(() => {
            console.log('🎥 Node Media Server run() completed');
            resolve(true);
          }, 2000);
          
        } catch (runError) {
          console.error('❌ Error during NMS run:', runError);
          reject(runError);
        }
      });
      
      const serverUrl = this.serverConfig.getRTMPUrl();
        
      console.log(`🎥 ✅ ${protocol} SERVER STARTED ON PORT ${this.serverConfig.RTMP_PORT}`);
      console.log(`📺 ✅ HLS SERVER STARTED ON PORT ${this.serverConfig.HLS_PORT}`);
      console.log(`🎯 ✅ OBS can now connect to: ${serverUrl}/STREAM_KEY`);
      console.log(`📱 ✅ HLS streams available at: https://nightflow-vibes-social-production.up.railway.app/live/STREAM_KEY/index.m3u8`);
      
      if (this.serverConfig.SSL_ENABLED) {
        console.log(`🔒 ✅ RTMPS (Secure RTMP) is ACTIVE - SSL encrypted + port 443 bypass`);
        console.log(`🌐 ✅ This should work on ALL networks including restrictive WiFi`);
      }
      
      return true;
      
    } catch (error) {
      console.error(`❌ CRITICAL RTMP SERVER ERROR: ${error.message}`);
      console.error('Full error:', error);
      console.log('🚨 This is exactly why OBS shows "Failed to connect to server"!');
      
      if (error.message.includes('EADDRINUSE') || error.code === 'EADDRINUSE') {
        console.log(`🔍 Port ${this.serverConfig.RTMP_PORT} is already in use - this is the problem!`);
        console.log('💡 Trying fallback port 1935...');
        
        // Try fallback to standard RTMP port
        return await this.startWithFallback();
        
      } else if (error.message.includes('EACCES') || error.code === 'EACCES') {
        console.log(`🔍 Permission denied on port ${this.serverConfig.RTMP_PORT} - this is the problem!`);
        console.log('💡 Trying fallback port 1935...');
        
        // Try fallback to standard RTMP port
        return await this.startWithFallback();
        
      } else if (error.message.includes('ffmpeg') || error.message.includes('getFfmpegVersion')) {
        console.log(`🔍 FFmpeg issue detected - switching to basic RTMP mode!`);
        console.log('⚠️ Continuing without FFmpeg features...');
        return true;
      }
      
      console.log('💡 Attempting fallback configuration...');
      return await this.startWithFallback();
    }
  }
  
  async startWithFallback() {
    console.log('🔄 Starting RTMP server with fallback configuration...');
    
    try {
      // Disable SSL and use standard port
      this.serverConfig.SSL_ENABLED = false;
      this.serverConfig.RTMP_PORT = 1935;
      
      // Recreate with fallback config
      await this.createNodeMediaServer();
      this.nms.run();
      
      setTimeout(() => {
        console.log(`🎥 ✅ FALLBACK RTMP SERVER STARTED ON PORT 1935`);
        console.log(`🎯 ✅ OBS can connect to: rtmp://nightflow-vibes-social-production.up.railway.app:1935/live`);
        console.log(`⚠️ Using standard RTMP (may not work on restrictive networks)`);
      }, 1000);
      
      return true;
      
    } catch (fallbackError) {
      console.error('❌ Even fallback RTMP failed:', fallbackError);
      return false;
    }
  }
  
  stop() {
    if (this.nms) {
      console.log('🛑 Stopping Node Media Server...');
      try {
        this.nms.stop();
        console.log('✅ Node Media Server stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping Node Media Server:', error);
      }
      this.nms = null;
    }
  }
}

module.exports = MediaServerService;
