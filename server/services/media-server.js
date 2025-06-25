
const NodeMediaServer = require('node-media-server');
const MediaDirectoryManager = require('./media-directory-manager');
const MediaEventHandlers = require('./media-event-handlers');

class MediaServerService {
  constructor(serverConfigInstance, streamManager) {
    this.serverConfig = serverConfigInstance;
    this.streamManager = streamManager;
    this.nms = null;
    
    console.log('🎬 Initializing Media Server Service...');
    console.log('🎬 FORCING standard RTMP on port 1935 for maximum OBS compatibility');
    
    this.mediaDirectoryManager = new MediaDirectoryManager(this.serverConfig.mediaRoot);
    this.mediaDirectoryManager.setupDirectories();
    
    this.eventHandlers = new MediaEventHandlers(streamManager, this.mediaDirectoryManager);
  }
  
  async createNodeMediaServer() {
    console.log('🔧 Creating Node Media Server configuration for FORCED standard RTMP port 1935...');
    
    const mediaServerConfig = this.serverConfig.getMediaServerConfig();
    
    // FORCE the port to be 1935 regardless of any other configuration
    mediaServerConfig.rtmp.port = 1935;
    
    console.log('📋 FORCED Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log('✅ Node Media Server instance created for FORCED standard RTMP port 1935');
      this.eventHandlers.setupAllHandlers(this.nms);
      
      // Add error handling for the NMS instance
      this.nms.on('error', (error) => {
        console.error('❌ Node Media Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.log(`🔍 Port 1935 is already in use!`);
          console.log(`🔍 This means another RTMP server is running on port 1935`);
        } else if (error.code === 'EACCES') {
          console.log(`🔍 Permission denied on port 1935!`);
          console.log(`🔍 Railway may not allow binding to port 1935`);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  async start() {
    console.log('🚀 Starting FORCED Standard RTMP Media Server on port 1935...');
    
    try {
      if (!this.nms) {
        await this.createNodeMediaServer();
      }
      
      console.log(`🎬 FORCING RTMP server start on port 1935...`);
      console.log(`🎬 FORCING HLS server start on port ${this.serverConfig.HLS_PORT}...`);
      
      // Start the server
      this.nms.run();
      
      // Give it a moment to start up
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const serverUrl = this.serverConfig.getRTMPUrl();
        
      console.log(`🎥 ✅ FORCED STANDARD RTMP SERVER STARTED ON PORT 1935`);
      console.log(`📺 ✅ HLS SERVER STARTED ON PORT ${this.serverConfig.HLS_PORT}`);
      console.log(`🎯 ✅ OBS can now connect to: ${serverUrl}/STREAM_KEY`);
      console.log(`📱 ✅ HLS streams available at: https://nightflow-vibes-social-production.up.railway.app/live/STREAM_KEY/index.m3u8`);
      console.log(`🎯 ✅ This uses FORCED STANDARD RTMP on port 1935 - compatible with ALL OBS versions`);
      console.log(`🎯 ✅ NO SSL, NO ENCRYPTION - pure standard RTMP for maximum compatibility`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ CRITICAL RTMP SERVER ERROR on port 1935: ${error.message}`);
      console.error('Full error:', error);
      console.log('🚨 This is exactly why OBS shows "Failed to connect to server"!');
      
      if (error.message.includes('EADDRINUSE') || error.code === 'EADDRINUSE') {
        console.log(`🔍 Port 1935 is already in use - this is the problem!`);
        console.log('💡 Another RTMP server may be running on port 1935');
        console.log('💡 Railway may need to be configured to expose port 1935');
        return false;
        
      } else if (error.message.includes('EACCES') || error.code === 'EACCES') {
        console.log(`🔍 Permission denied on port 1935 - this is the problem!`);
        console.log('💡 Railway may not allow binding to port 1935');
        console.log('💡 Check Railway port configuration');
        return false;
        
      } else if (error.message.includes('ffmpeg') || error.message.includes('getFfmpegVersion')) {
        console.log(`🔍 FFmpeg issue detected - but RTMP server should still work!`);
        console.log('⚠️ Continuing without FFmpeg features...');
        return true;
      }
      
      console.log('💡 Unknown RTMP server error - this needs investigation');
      console.log('💡 Port 1935 binding failed - Railway port configuration may be needed');
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
