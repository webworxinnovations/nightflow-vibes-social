
const NodeMediaServer = require('node-media-server');
const path = require('path');
const fs = require('fs');

class MediaServerService {
  constructor(config, streamManager) {
    this.config = config;
    this.streamManager = streamManager;
    this.nms = null;
    this.setupMediaDirectories();
    this.createNodeMediaServer();
  }
  
  setupMediaDirectories() {
    // Ensure media directories exist
    const mediaRoot = this.config.mediaRoot || '/tmp/media';
    const liveDir = path.join(mediaRoot, 'live');
    
    if (!fs.existsSync(mediaRoot)) {
      fs.mkdirSync(mediaRoot, { recursive: true });
    }
    
    if (!fs.existsSync(liveDir)) {
      fs.mkdirSync(liveDir, { recursive: true });
    }
    
    console.log(`📁 Media directories ready: ${mediaRoot}`);
    console.log(`📁 Live streams directory: ${liveDir}`);
  }
  
  createNodeMediaServer() {
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
      },
      relay: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            mode: 'push',
            edge: `rtmp://127.0.0.1:${this.config.rtmp.port}/live`
          }
        ]
      }
    };
    
    this.nms = new NodeMediaServer(mediaServerConfig);
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // RTMP Connection Events
    this.nms.on('preConnect', (id, args) => {
      console.log(`[RTMP] Pre-connect: ${id} from ${args.ip}`);
    });

    this.nms.on('postConnect', (id, args) => {
      console.log(`[RTMP] Connected: ${id} from ${args.ip}`);
    });

    this.nms.on('doneConnect', (id, args) => {
      console.log(`[RTMP] Disconnected: ${id}`);
    });

    // RTMP Publishing Events (OBS starts streaming)
    this.nms.on('prePublish', (id, StreamPath, args) => {
      console.log(`[RTMP] Pre-publish: ${id} StreamPath=${StreamPath}`);
      
      // Extract stream key from path (format: /live/STREAM_KEY)
      const pathParts = StreamPath.split('/');
      if (pathParts.length >= 3 && pathParts[1] === 'live') {
        const streamKey = pathParts[2];
        console.log(`🔑 Stream key detected: ${streamKey}`);
        
        // Add stream to manager
        this.streamManager.addStream(streamKey);
        
        // You could add stream key validation here
        // For now, allow all streams that start with 'nf_'
        if (!streamKey.startsWith('nf_')) {
          console.log(`❌ Invalid stream key format: ${streamKey}`);
          // Reject the stream
          return false;
        }
        
        console.log(`✅ Stream authorized: ${streamKey}`);
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
      console.log(`[RTMP] Pre-play: ${id} StreamPath=${StreamPath}`);
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
  }
  
  start() {
    try {
      if (!this.nms) {
        throw new Error('NodeMediaServer not initialized');
      }
      
      this.nms.run();
      console.log(`✅ RTMP SERVER STARTED ON PORT ${this.config.rtmp.port}`);
      console.log(`✅ HLS SERVER STARTED ON PORT ${this.config.http.port}`);
      console.log(`🎥 Ready for OBS connections at rtmp://your-domain/live/STREAM_KEY`);
      console.log(`📺 HLS streams available at http://your-domain:${this.config.http.port}/live/STREAM_KEY/index.m3u8`);
      return true;
    } catch (error) {
      console.error(`❌ Media Server Error: ${error.message}`);
      console.log('⚠️  API server running, media server failed');
      return false;
    }
  }
  
  stop() {
    if (this.nms) {
      this.nms.stop();
      console.log('🛑 Media server stopped');
    }
  }
}

module.exports = MediaServerService;
