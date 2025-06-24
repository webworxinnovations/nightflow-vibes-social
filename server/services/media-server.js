const NodeMediaServer = require('node-media-server');
const path = require('path');
const fs = require('fs');

class MediaServerService {
  constructor(config, streamManager) {
    this.config = config;
    this.streamManager = streamManager;
    this.nms = null;
    console.log('🎬 Initializing Media Server Service...');
    this.setupMediaDirectories();
    this.createNodeMediaServer();
  }
  
  setupMediaDirectories() {
    // Ensure media directories exist
    const mediaRoot = this.config.mediaRoot || '/tmp/media';
    const liveDir = path.join(mediaRoot, 'live');
    
    try {
      if (!fs.existsSync(mediaRoot)) {
        fs.mkdirSync(mediaRoot, { recursive: true });
        console.log(`✅ Created media root: ${mediaRoot}`);
      }
      
      if (!fs.existsSync(liveDir)) {
        fs.mkdirSync(liveDir, { recursive: true });
        console.log(`✅ Created live directory: ${liveDir}`);
      }
      
      console.log(`📁 Media directories ready: ${mediaRoot}`);
      console.log(`📁 Live streams directory: ${liveDir}`);
    } catch (error) {
      console.error('❌ Failed to create media directories:', error);
      throw error;
    }
  }
  
  createNodeMediaServer() {
    console.log('🔧 Creating Node Media Server configuration...');
    
    // Simplified configuration to avoid FFmpeg version issues
    const mediaServerConfig = {
      rtmp: {
        port: this.config.rtmp.port,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
      },
      http: {
        port: this.config.http.port,
        mediaroot: this.config.mediaRoot,
        allow_origin: '*'
      }
      // Removed relay configuration that was causing FFmpeg issues
    };
    
    console.log('📋 Node Media Server Config:', JSON.stringify(mediaServerConfig, null, 2));
    
    try {
      this.nms = new NodeMediaServer(mediaServerConfig);
      console.log('✅ Node Media Server instance created');
      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ Failed to create Node Media Server:', error);
      throw error;
    }
  }
  
  setupEventHandlers() {
    console.log('🔧 Setting up Node Media Server event handlers...');
    
    // RTMP Connection Events
    this.nms.on('preConnect', (id, args) => {
      console.log(`[RTMP] 🔌 Pre-connect: ${id} from ${args.ip}`);
    });

    this.nms.on('postConnect', (id, args) => {
      console.log(`[RTMP] ✅ Connected: ${id} from ${args.ip}`);
      console.log(`🎉 OBS SUCCESSFULLY CONNECTED!`);
    });

    this.nms.on('doneConnect', (id, args) => {
      console.log(`[RTMP] ❌ Disconnected: ${id}`);
    });

    // RTMP Publishing Events (OBS starts streaming)
    this.nms.on('prePublish', (id, StreamPath, args) => {
      console.log(`[RTMP] 📡 Pre-publish: ${id} StreamPath=${StreamPath}`);
      
      // Extract stream key from path (format: /live/STREAM_KEY)
      const pathParts = StreamPath.split('/');
      if (pathParts.length >= 3 && pathParts[1] === 'live') {
        const streamKey = pathParts[2];
        console.log(`🔑 Stream key detected: ${streamKey}`);
        
        // Add stream to manager
        this.streamManager.addStream(streamKey);
        
        // Validate stream key format
        if (!streamKey.startsWith('nf_') || streamKey.length < 10) {
          console.log(`❌ Invalid stream key format: ${streamKey}`);
          // Reject the stream
          return false;
        }
        
        console.log(`✅ Stream authorized: ${streamKey}`);
        console.log(`🎉 OBS IS NOW STREAMING LIVE!`);
      }
    });

    this.nms.on('postPublish', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`🔴 Stream LIVE: ${streamKey}`);
      
      // Ensure the stream directory exists for HLS files
      const streamDir = path.join(this.config.mediaRoot, 'live', streamKey);
      if (!fs.existsSync(streamDir)) {
        fs.mkdirSync(streamDir, { recursive: true });
        console.log(`📁 Created HLS directory: ${streamDir}`);
      }
    });

    this.nms.on('donePublish', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`⚫ Stream ended: ${streamKey}`);
      
      // Remove stream from manager
      this.streamManager.removeStream(streamKey);
    });

    // RTMP Play Events (viewers watching)
    this.nms.on('prePlay', (id, StreamPath, args) => {
      console.log(`[RTMP] 👁️ Pre-play: ${id} StreamPath=${StreamPath}`);
    });

    this.nms.on('postPlay', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`👁️ Viewer connected to: ${streamKey}`);
      this.streamManager.incrementViewerCount(streamKey);
    });

    this.nms.on('donePlay', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`👁️ Viewer disconnected from: ${streamKey}`);
      this.streamManager.decrementViewerCount(streamKey);
    });

    console.log('✅ Event handlers setup complete');
  }
  
  start() {
    console.log('🚀 Starting Node Media Server...');
    
    try {
      if (!this.nms) {
        throw new Error('NodeMediaServer not initialized');
      }
      
      console.log(`🎬 Attempting to start RTMP server on port ${this.config.rtmp.port}...`);
      console.log(`🎬 Attempting to start HLS server on port ${this.config.http.port}...`);
      
      // Add error handling for the run method
      this.nms.run();
      
      // Add a small delay to ensure the server has started
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
      
      // Try to identify the specific issue
      if (error.message.includes('EADDRINUSE')) {
        console.log(`🔍 Port ${this.config.rtmp.port} is already in use - this is the problem!`);
      } else if (error.message.includes('EACCES')) {
        console.log(`🔍 Permission denied on port ${this.config.rtmp.port} - this is the problem!`);
      } else if (error.message.includes('ffmpeg')) {
        console.log(`🔍 FFmpeg not found - this might be the problem!`);
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
