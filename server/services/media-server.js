
const NodeMediaServer = require('node-media-server');
const MediaDirectoryManager = require('./media-directory-manager');
const MediaEventHandlers = require('./media-event-handlers');

class MediaServerService {
  constructor(config, streamManager) {
    this.config = config;
    this.streamManager = streamManager;
    this.nms = null;
    
    console.log('🎬 Initializing Media Server Service...');
    
    this.mediaDirectoryManager = new MediaDirectoryManager(this.config.mediaRoot);
    this.mediaDirectoryManager.setupDirectories();
    
    this.eventHandlers = new MediaEventHandlers(streamManager, this.mediaDirectoryManager);
    this.createNodeMediaServer();
  }
  
  createNodeMediaServer() {
    console.log('🔧 Creating Node Media Server configuration...');
    
    const mediaServerConfig = {
      rtmp: {
        port: this.config.rtmp.port,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        allow_origin: '*'
      },
      http: {
        port: this.config.http.port,
        mediaroot: this.config.mediaRoot,
        allow_origin: '*',
        api: false
      },
      logType: 1
    };
    
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log('✅ Node Media Server instance created');
      this.eventHandlers.setupAllHandlers(this.nms);
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  start() {
    console.log('🚀 Starting Node Media Server...');
    
    try {
      if (!this.nms) {
        throw new Error('NodeMediaServer not initialized');
      }
      
      console.log(`🎬 Attempting to start RTMP server on port ${this.config.rtmp.port}...`);
      console.log(`🎬 Attempting to start HLS server on port ${this.config.http.port}...`);
      
      try {
        this.nms.run();
      } catch (runError) {
        console.error('❌ Error during NMS run:', runError);
        throw runError;
      }
      
      setTimeout(() => {
        console.log(`🎥 ✅ RTMP SERVER STARTED ON PORT ${this.config.rtmp.port}`);
        console.log(`📺 ✅ HLS SERVER STARTED ON PORT ${this.config.http.port}`);
        console.log(`🎯 ✅ OBS can now connect to: rtmp://nightflow-vibes-social-production.up.railway.app/live/STREAM_KEY`);
        console.log(`📱 ✅ HLS streams available at: https://nightflow-vibes-social-production.up.railway.app/live/STREAM_KEY/index.m3u8`);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error(`❌ CRITICAL RTMP SERVER ERROR: ${error.message}`);
      console.error('Full error:', error);
      console.log('🚨 This is exactly why OBS shows "Failed to connect to server"!');
      
      if (error.message.includes('EADDRINUSE')) {
        console.log(`🔍 Port ${this.config.rtmp.port} is already in use - this is the problem!`);
      } else if (error.message.includes('EACCES')) {
        console.log(`🔍 Permission denied on port ${this.config.rtmp.port} - this is the problem!`);
      } else if (error.message.includes('ffmpeg') || error.message.includes('getFfmpegVersion')) {
        console.log(`🔍 FFmpeg issue detected - switching to basic RTMP mode!`);
        console.log('⚠️ Continuing without FFmpeg features...');
        return true;
      }
      
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
