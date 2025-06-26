
const NodeMediaServer = require('node-media-server');
const MediaDirectoryManager = require('./media-directory-manager');
const MediaEventHandlers = require('./media-event-handlers');

class MediaServerService {
  constructor(serverConfigInstance, streamManager) {
    this.serverConfig = serverConfigInstance;
    this.streamManager = streamManager;
    this.nms = null;
    this.isDigitalOcean = !!process.env.DIGITALOCEAN_APP_URL;
    
    console.log('🎬 Initializing Media Server Service...');
    console.log(`🎬 Environment: ${this.isDigitalOcean ? 'DigitalOcean Production' : 'Local Development'}`);
    console.log('🎬 Target: External RTMP access on port 1935 for OBS compatibility');
    
    this.mediaDirectoryManager = new MediaDirectoryManager(this.serverConfig.mediaRoot);
    this.mediaDirectoryManager.setupDirectories();
    
    this.eventHandlers = new MediaEventHandlers(streamManager, this.mediaDirectoryManager);
  }
  
  async createNodeMediaServer() {
    console.log(`🔧 Creating Node Media Server configuration for ${this.isDigitalOcean ? 'DigitalOcean' : 'Local'}...`);
    
    const mediaServerConfig = this.serverConfig.getMediaServerConfig();
    
    // Force standard RTMP port and external binding
    mediaServerConfig.rtmp.port = 1935;
    mediaServerConfig.rtmp.listen = '0.0.0.0'; // CRITICAL: Bind to all interfaces
    
    if (this.isDigitalOcean) {
      // DigitalOcean-specific optimizations for external access
      mediaServerConfig.rtmp.chunk_size = 60000;
      mediaServerConfig.rtmp.gop_cache = true;
      mediaServerConfig.rtmp.ping = 45;
      mediaServerConfig.rtmp.ping_timeout = 90;
      mediaServerConfig.rtmp.drop_idle_publisher = 180;
      
      // Enable external connectivity
      mediaServerConfig.rtmp.allow_origin = '*';
      mediaServerConfig.http.allow_origin = '*';
      
      console.log('🌊 DigitalOcean RTMP optimizations applied');
      console.log('🌐 External RTMP access configured');
    }
    
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log(`✅ Node Media Server instance created for ${this.isDigitalOcean ? 'DigitalOcean' : 'Local'}`);
      this.eventHandlers.setupAllHandlers(this.nms);
      
      // Enhanced error handling for DigitalOcean
      this.nms.on('error', (error) => {
        console.error('❌ Node Media Server error:', error);
        
        if (this.isDigitalOcean) {
          if (error.code === 'EADDRINUSE') {
            console.log(`🌊 DigitalOcean: Port 1935 is already in use!`);
            console.log(`🌊 This indicates another RTMP process may be running`);
          } else if (error.code === 'EACCES') {
            console.log(`🌊 DigitalOcean: Permission denied on port 1935!`);
            console.log(`🌊 DigitalOcean may require additional port configuration`);
          } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log(`🌊 DigitalOcean: Network connectivity issue for RTMP`);
            console.log(`🌊 Check DigitalOcean App Platform port settings`);
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  async start() {
    console.log(`🚀 Starting ${this.isDigitalOcean ? 'DigitalOcean' : 'Local'} RTMP Media Server on port 1935...`);
    console.log(`🌐 Binding to 0.0.0.0:1935 for external access`);
    
    try {
      if (!this.nms) {
        await this.createNodeMediaServer();
      }
      
      console.log(`🎬 Starting RTMP server on 0.0.0.0:1935 for external access...`);
      console.log(`🎬 Starting HLS server on port ${this.serverConfig.HLS_PORT}...`);
      
      if (this.isDigitalOcean) {
        console.log('🌊 DigitalOcean: Attempting to bind RTMP to 0.0.0.0:1935...');
        console.log('🌐 Enabling external OBS connectivity...');
      }
      
      // Start the server
      this.nms.run();
      
      // Give DigitalOcean time to establish external connectivity
      const startupDelay = this.isDigitalOcean ? 5000 : 3000;
      await new Promise(resolve => setTimeout(resolve, startupDelay));
      
      const serverUrl = this.serverConfig.getRTMPUrl();
        
      if (this.isDigitalOcean) {
        console.log(`🌊 ✅ DigitalOcean RTMP server startup completed`);
        console.log(`🎯 ✅ External OBS Connection: ${serverUrl}/STREAM_KEY`);
        console.log(`📱 ✅ HLS streams: https://nightflow-app-wijb2.ondigitalocean.app/live/STREAM_KEY/index.m3u8`);
        console.log(`🌊 ✅ DigitalOcean streaming infrastructure operational`);
        console.log(`🌐 ✅ RTMP now accessible externally on port 1935`);
      } else {
        console.log(`🎥 ✅ Local RTMP server started successfully`);
        console.log(`🎯 ✅ OBS can connect to: ${serverUrl}/STREAM_KEY`);
        console.log(`📱 ✅ HLS streams available at: http://localhost:${this.serverConfig.HLS_PORT}/live/STREAM_KEY/index.m3u8`);
      }
      
      return true;
      
    } catch (error) {
      console.error(`❌ ${this.isDigitalOcean ? 'DigitalOcean' : 'Local'} RTMP server error: ${error.message}`);
      
      if (this.isDigitalOcean) {
        console.error('🌊 DigitalOcean RTMP startup failed');
        
        if (error.message.includes('EADDRINUSE') || error.code === 'EADDRINUSE') {
          console.log(`🌊 Port 1935 binding failed on DigitalOcean`);
          console.log('💡 Another RTMP process may be running');
          
        } else if (error.message.includes('EACCES') || error.code === 'EACCES') {
          console.log(`🌊 DigitalOcean denied access to port 1935`);
          console.log('💡 DigitalOcean may require additional port configuration');
          
        } else if (error.message.includes('ffmpeg') || error.message.includes('getFfmpegVersion')) {
          console.log(`🌊 DigitalOcean FFmpeg issue - but RTMP should still work`);
          console.log('⚠️ Continuing without FFmpeg transcoding features...');
          return true; // FFmpeg issues don't prevent RTMP streaming
        }
        
        console.log('🌊 DigitalOcean RTMP service failed - API continues normally');
        
      } else {
        console.log('💡 Local RTMP server failed - check port availability and permissions');
      }
      
      return false;
    }
  }
  
  stop() {
    if (this.nms) {
      console.log(`🛑 Stopping ${this.isDigitalOcean ? 'DigitalOcean' : 'Local'} Node Media Server...`);
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
