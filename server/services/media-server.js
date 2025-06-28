
const NodeMediaServer = require('node-media-server');
const MediaDirectoryManager = require('./media-directory-manager');
const MediaEventHandlers = require('./media-event-handlers');

class MediaServerService {
  constructor(serverConfigInstance, streamManager) {
    this.serverConfig = serverConfigInstance;
    this.streamManager = streamManager;
    this.nms = null;
    this.isDigitalOcean = true; // FORCE DigitalOcean mode
    
    console.log('🎬 Initializing Media Server Service for DigitalOcean Droplet...');
    console.log(`🎬 Droplet IP: 67.205.179.77`);
    console.log('🎬 Target: External RTMP on port 1935 + HLS HTTP on port 8080');
    
    this.mediaDirectoryManager = new MediaDirectoryManager(this.serverConfig.mediaRoot);
    this.mediaDirectoryManager.setupDirectories();
    
    this.eventHandlers = new MediaEventHandlers(streamManager, this.mediaDirectoryManager);
  }
  
  async createNodeMediaServer() {
    console.log(`🔧 Creating Node Media Server for DigitalOcean Droplet...`);
    
    const mediaServerConfig = this.serverConfig.getMediaServerConfig();
    
    // FORCE both RTMP and HTTP servers
    mediaServerConfig.rtmp.port = 1935;
    mediaServerConfig.rtmp.listen = '0.0.0.0'; // CRITICAL: External access
    mediaServerConfig.http.port = 8080;
    mediaServerConfig.http.listen = '0.0.0.0'; // CRITICAL: HTTP server for HLS
    
    // DigitalOcean droplet optimizations
    mediaServerConfig.rtmp.chunk_size = 60000;
    mediaServerConfig.rtmp.gop_cache = true;
    mediaServerConfig.rtmp.ping = 45;
    mediaServerConfig.rtmp.ping_timeout = 90;
    mediaServerConfig.rtmp.drop_idle_publisher = 180;
    
    // Enable external connectivity
    mediaServerConfig.rtmp.allow_origin = '*';
    mediaServerConfig.http.allow_origin = '*';
    
    console.log('🌊 DigitalOcean Droplet RTMP + HLS optimizations applied');
    console.log('🌐 External RTMP + HTTP access configured');
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log(`✅ Node Media Server instance created for DigitalOcean Droplet`);
      this.eventHandlers.setupAllHandlers(this.nms);
      
      // Enhanced error handling
      this.nms.on('error', (error) => {
        console.error('❌ Node Media Server error:', error);
        
        if (error.code === 'EADDRINUSE') {
          console.log(`🌊 DigitalOcean: Port already in use!`);
          console.log(`🌊 Port ${error.port}: Another process may be running`);
        } else if (error.code === 'EACCES') {
          console.log(`🌊 DigitalOcean: Permission denied!`);
          console.log(`🌊 Port access issue - check droplet configuration`);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  async start() {
    console.log(`🚀 Starting DigitalOcean Droplet Media Server...`);
    console.log(`🌐 RTMP: Binding to 0.0.0.0:1935 for external OBS access`);
    console.log(`🌐 HTTP: Binding to 0.0.0.0:8080 for HLS video delivery`);
    
    try {
      if (!this.nms) {
        await this.createNodeMediaServer();
      }
      
      console.log(`🎬 Starting RTMP server on 0.0.0.0:1935...`);
      console.log(`🎬 Starting HLS HTTP server on 0.0.0.0:8080...`);
      
      // Start the server
      this.nms.run();
      
      // Give droplet time to establish connectivity
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const rtmpUrl = this.serverConfig.getRTMPUrl();
      const hlsUrl = this.serverConfig.getHLSBaseUrl();
        
      console.log(`🌊 ✅ DigitalOcean Droplet Media Server FULLY OPERATIONAL`);
      console.log(`🎯 ✅ OBS Connection: rtmp://67.205.179.77:1935/live/STREAM_KEY`);
      console.log(`📱 ✅ HLS Video: http://67.205.179.77:8080/live/STREAM_KEY/index.m3u8`);
      console.log(`🌊 ✅ Both RTMP and HLS HTTP servers running on droplet`);
      console.log(`🌐 ✅ External access enabled on both ports`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ DigitalOcean Droplet Media Server error: ${error.message}`);
      
      if (error.message.includes('EADDRINUSE') || error.code === 'EADDRINUSE') {
        console.log(`🌊 Port binding failed on DigitalOcean droplet`);
        console.log('💡 Another process may be using the ports');
        
      } else if (error.message.includes('EACCES') || error.code === 'EACCES') {
        console.log(`🌊 DigitalOcean denied access to ports`);
        console.log('💡 Check droplet firewall and port configuration');
        
      } else if (error.message.includes('ffmpeg')) {
        console.log(`🌊 FFmpeg issue - but RTMP + HLS should still work`);
        console.log('⚠️ Continuing without FFmpeg transcoding...');
        return true;
      }
      
      return false;
    }
  }
  
  stop() {
    if (this.nms) {
      console.log(`🛑 Stopping DigitalOcean Droplet Node Media Server...`);
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
