
const NodeMediaServer = require('node-media-server');
const MediaDirectoryManager = require('./media-directory-manager');
const MediaEventHandlers = require('./media-event-handlers');

class MediaServerService {
  constructor(serverConfigInstance, streamManager) {
    this.serverConfig = serverConfigInstance;
    this.streamManager = streamManager;
    this.nms = null;
    this.isRailway = !!process.env.RAILWAY_ENVIRONMENT;
    
    console.log('🎬 Initializing Media Server Service...');
    console.log(`🎬 Environment: ${this.isRailway ? 'Railway Production' : 'Local Development'}`);
    console.log('🎬 Target: Standard RTMP on port 1935 for maximum OBS compatibility');
    
    this.mediaDirectoryManager = new MediaDirectoryManager(this.serverConfig.mediaRoot);
    this.mediaDirectoryManager.setupDirectories();
    
    this.eventHandlers = new MediaEventHandlers(streamManager, this.mediaDirectoryManager);
  }
  
  async createNodeMediaServer() {
    console.log(`🔧 Creating Node Media Server configuration for ${this.isRailway ? 'Railway' : 'Local'}...`);
    
    const mediaServerConfig = this.serverConfig.getMediaServerConfig();
    
    // Force standard RTMP port regardless of environment
    mediaServerConfig.rtmp.port = 1935;
    
    if (this.isRailway) {
      // Railway-specific optimizations
      mediaServerConfig.rtmp.chunk_size = 60000;
      mediaServerConfig.rtmp.gop_cache = true;
      mediaServerConfig.rtmp.ping = 45; // Longer ping for Railway latency
      mediaServerConfig.rtmp.ping_timeout = 90; // Longer timeout for Railway
      mediaServerConfig.rtmp.drop_idle_publisher = 180; // 3 minutes for Railway
      
      console.log('🚄 Railway RTMP optimizations applied');
    }
    
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log(`✅ Node Media Server instance created for ${this.isRailway ? 'Railway' : 'Local'}`);
      this.eventHandlers.setupAllHandlers(this.nms);
      
      // Enhanced error handling for Railway
      this.nms.on('error', (error) => {
        console.error('❌ Node Media Server error:', error);
        
        if (this.isRailway) {
          if (error.code === 'EADDRINUSE') {
            console.log(`🚄 Railway: Port 1935 is already in use!`);
            console.log(`🚄 This indicates Railway may not support custom TCP ports`);
            console.log(`🚄 Consider using Railway's HTTP streaming alternatives`);
          } else if (error.code === 'EACCES') {
            console.log(`🚄 Railway: Permission denied on port 1935!`);
            console.log(`🚄 Railway infrastructure may not allow custom TCP port binding`);
            console.log(`🚄 This is a known limitation of some cloud platforms`);
          } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log(`🚄 Railway: Network connectivity issue for RTMP`);
            console.log(`🚄 Railway's networking may not support RTMP protocol properly`);
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  async start() {
    console.log(`🚀 Starting ${this.isRailway ? 'Railway' : 'Local'} RTMP Media Server on port 1935...`);
    
    try {
      if (!this.nms) {
        await this.createNodeMediaServer();
      }
      
      console.log(`🎬 Starting RTMP server on port 1935...`);
      console.log(`🎬 Starting HLS server on port ${this.serverConfig.HLS_PORT}...`);
      
      if (this.isRailway) {
        console.log('🚄 Railway: Attempting to bind RTMP to port 1935...');
        console.log('🚄 Note: Railway may not support custom TCP ports like 1935');
      }
      
      // Start the server
      this.nms.run();
      
      // Give Railway more time to establish the connection
      const startupDelay = this.isRailway ? 5000 : 3000;
      await new Promise(resolve => setTimeout(resolve, startupDelay));
      
      const serverUrl = this.serverConfig.getRTMPUrl();
        
      if (this.isRailway) {
        console.log(`🚄 ✅ Railway RTMP server startup completed`);
        console.log(`🎯 ✅ OBS Connection: ${serverUrl}/STREAM_KEY`);
        console.log(`📱 ✅ HLS streams: https://nightflow-vibes-social-production.up.railway.app/live/STREAM_KEY/index.m3u8`);
        console.log(`🚄 ✅ Railway streaming infrastructure operational`);
        console.log(`🚄 ⚠️  If OBS can't connect, Railway may not support TCP port 1935`);
      } else {
        console.log(`🎥 ✅ Local RTMP server started successfully`);
        console.log(`🎯 ✅ OBS can connect to: ${serverUrl}/STREAM_KEY`);
        console.log(`📱 ✅ HLS streams available at: http://localhost:${this.serverConfig.HLS_PORT}/live/STREAM_KEY/index.m3u8`);
      }
      
      return true;
      
    } catch (error) {
      console.error(`❌ ${this.isRailway ? 'Railway' : 'Local'} RTMP server error: ${error.message}`);
      
      if (this.isRailway) {
        console.error('🚄 Railway RTMP startup failed - this is the root cause of OBS connection issues');
        
        if (error.message.includes('EADDRINUSE') || error.code === 'EADDRINUSE') {
          console.log(`🚄 Port 1935 binding failed on Railway`);
          console.log('💡 Railway may not expose TCP port 1935 externally');
          console.log('💡 This explains why OBS shows "Failed to connect to server"');
          console.log('💡 Railway configuration may need custom TCP port support');
          
        } else if (error.message.includes('EACCES') || error.code === 'EACCES') {
          console.log(`🚄 Railway denied access to port 1935`);
          console.log('💡 Railway platform restrictions prevent RTMP server binding');
          console.log('💡 This is why OBS cannot establish RTMP connection');
          
        } else if (error.message.includes('ffmpeg') || error.message.includes('getFfmpegVersion')) {
          console.log(`🚄 Railway FFmpeg issue - but RTMP should still work`);
          console.log('⚠️ Continuing without FFmpeg transcoding features...');
          return true; // FFmpeg issues don't prevent RTMP streaming
        }
        
        console.log('🚄 Railway RTMP service failed - API continues normally');
        console.log('💡 Consider implementing HTTP-based streaming alternatives for Railway');
        
      } else {
        console.log('💡 Local RTMP server failed - check port availability and permissions');
      }
      
      return false;
    }
  }
  
  stop() {
    if (this.nms) {
      console.log(`🛑 Stopping ${this.isRailway ? 'Railway' : 'Local'} Node Media Server...`);
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
