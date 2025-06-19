
const NodeMediaServer = require('node-media-server');

class MediaServerService {
  constructor(config, streamManager) {
    this.config = config;
    this.streamManager = streamManager;
    this.nms = new NodeMediaServer(config);
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // RTMP Events
    this.nms.on('preConnect', (id, args) => {
      console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
    });

    this.nms.on('postConnect', (id, args) => {
      console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
    });

    this.nms.on('doneConnect', (id, args) => {
      console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
    });

    this.nms.on('prePublish', (id, StreamPath, args) => {
      console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      // Extract stream key from path (format: /live/STREAM_KEY)
      const streamKey = StreamPath.split('/').pop();
      this.streamManager.addStream(streamKey);
    });

    this.nms.on('postPublish', (id, StreamPath, args) => {
      console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    });

    this.nms.on('donePublish', (id, StreamPath, args) => {
      console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      // Extract stream key from path
      const streamKey = StreamPath.split('/').pop();
      this.streamManager.removeStream(streamKey);
    });
  }
  
  start() {
    try {
      this.nms.run();
      console.log(`✅ RTMP SERVER STARTED ON PORT ${this.config.rtmp.port}`);
      console.log(`✅ HLS SERVER STARTED ON PORT ${this.config.http.port}`);
      console.log(`⚡ Ready for OBS connections`);
      return true;
    } catch (error) {
      console.error(`❌ Media Server Error: ${error.message}`);
      console.log('⚠️  API server running, media server failed');
      return false;
    }
  }
  
  stop() {
    this.nms.stop();
  }
}

module.exports = MediaServerService;
