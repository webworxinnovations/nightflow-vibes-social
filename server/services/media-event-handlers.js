
const path = require('path');

class MediaEventHandlers {
  constructor(streamManager, mediaDirectoryManager) {
    this.streamManager = streamManager;
    this.mediaDirectoryManager = mediaDirectoryManager;
  }

  setupConnectionHandlers(nms) {
    nms.on('preConnect', (id, args) => {
      console.log(`[RTMP] 🔌 Pre-connect: ${id} from ${args.ip}`);
    });

    nms.on('postConnect', (id, args) => {
      console.log(`[RTMP] ✅ Connected: ${id} from ${args.ip}`);
      console.log(`🎉 OBS SUCCESSFULLY CONNECTED!`);
    });

    nms.on('doneConnect', (id, args) => {
      console.log(`[RTMP] ❌ Disconnected: ${id}`);
    });
  }

  setupPublishHandlers(nms) {
    nms.on('prePublish', (id, StreamPath, args) => {
      console.log(`[RTMP] 📡 Pre-publish: ${id} StreamPath=${StreamPath}`);
      
      const pathParts = StreamPath.split('/');
      if (pathParts.length >= 3 && pathParts[1] === 'live') {
        const streamKey = pathParts[2];
        console.log(`🔑 Stream key detected: ${streamKey}`);
        
        this.streamManager.addStream(streamKey);
        
        if (!streamKey.startsWith('nf_') || streamKey.length < 10) {
          console.log(`❌ Invalid stream key format: ${streamKey}`);
          return false;
        }
        
        console.log(`✅ Stream authorized: ${streamKey}`);
        console.log(`🎉 OBS IS NOW STREAMING LIVE!`);
      }
    });

    nms.on('postPublish', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`🔴 Stream LIVE: ${streamKey}`);
      this.mediaDirectoryManager.createStreamDirectory(streamKey);
    });

    nms.on('donePublish', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`⚫ Stream ended: ${streamKey}`);
      this.streamManager.removeStream(streamKey);
    });
  }

  setupPlayHandlers(nms) {
    nms.on('prePlay', (id, StreamPath, args) => {
      console.log(`[RTMP] 👁️ Pre-play: ${id} StreamPath=${StreamPath}`);
    });

    nms.on('postPlay', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`👁️ Viewer connected to: ${streamKey}`);
      this.streamManager.incrementViewerCount(streamKey);
    });

    nms.on('donePlay', (id, StreamPath, args) => {
      const streamKey = StreamPath.split('/').pop();
      console.log(`👁️ Viewer disconnected from: ${streamKey}`);
      this.streamManager.decrementViewerCount(streamKey);
    });
  }

  setupAllHandlers(nms) {
    console.log('🔧 Setting up Node Media Server event handlers...');
    this.setupConnectionHandlers(nms);
    this.setupPublishHandlers(nms);
    this.setupPlayHandlers(nms);
    console.log('✅ Event handlers setup complete');
  }
}

module.exports = MediaEventHandlers;
