
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
    console.log('🔧 Creating Node Media Server configuration for standard RTMP...');
    
    const mediaServerConfig = this.serverConfig.getMediaServerConfig();
    
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log('✅ Node Media Server instance created for standard RTMP');
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
    console.log('🚀 Starting Standard RTMP Media Server...');
    
    try {
      if (!this.nms) {
        await this.createNodeMediaServer();
      }
      
      console.log(`🎬 Starting standard RTMP server on port ${this.serverConfig.RTMP_PORT}...`);
      console.log(`🎬 Starting HLS server on port ${this.serverConfig.HLS_PORT}...`);
      
      // Start the server
      this.nms.run();
      
      // Give it a moment to start up
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const serverUrl = this.serverConfig.getRTMPUrl();
        
      console.log(`🎥 ✅ STANDARD RTMP SERVER STARTED ON PORT ${this.serverConfig.RTMP_PORT}`);
      console.log(`📺 ✅ HLS SERVER STARTED ON PORT ${this.serverConfig.HLS_PORT}`);
      console.log(`🎯 ✅ OBS can now connect to: ${serverUrl}/STREAM_KEY`);
      console.log(`📱 ✅ HLS streams available at: https://nightflow-vibes-social-production.up.railway.app/live/STREAM_KEY/index.m3u8`);
      console.log(`🎯 ✅ This uses STANDARD RTMP - compatible with ALL OBS versions`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ CRITICAL RTMP SERVER ERROR: ${error.message}`);
      console.error('Full error:', error);
      console.log('🚨 This is exactly why OBS shows "Failed to connect to server"!');
      
      if (error.message.includes('EADDRINUSE') || error.code === 'EADDRINUSE') {
        console.log(`🔍 Port ${this.serverConfig.RTMP_PORT} is already in use - this is the problem!`);
        console.log('💡 The port conflict is preventing the RTMP server from starting');
        return false;
        
      } else if (error.message.includes('EACCES') || error.code === 'EACCES') {
        console.log(`🔍 Permission denied on port ${this.serverConfig.RTMP_PORT} - this is the problem!`);
        console.log('💡 Railway may not allow binding to this port');
        return false;
        
      } else if (error.message.includes('ffmpeg') || error.message.includes('getFfmpegVersion')) {
        console.log(`🔍 FFmpeg issue detected - but RTMP server should still work!`);
        console.log('⚠️ Continuing without FFmpeg features...');
        return true;
      }
      
      console.log('💡 Unknown RTMP server error - this needs investigation');
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
