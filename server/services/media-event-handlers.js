
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
      
      try {
        // Ensure StreamPath exists and is a string
        if (!StreamPath || typeof StreamPath !== 'string') {
          console.log(`❌ Invalid StreamPath: ${StreamPath}`);
          return false;
        }
        
        const pathParts = StreamPath.split('/');
        if (pathParts.length >= 3 && pathParts[1] === 'live') {
          const streamKey = pathParts[2];
          
          // Ensure streamKey exists and is a string
          if (!streamKey || typeof streamKey !== 'string') {
            console.log(`❌ Invalid stream key: ${streamKey}`);
            return false;
          }
          
          console.log(`🔑 Stream key detected: ${streamKey}`);
          
          this.streamManager.addStream(streamKey);
          
          if (!streamKey.startsWith('nf_') || streamKey.length < 10) {
            console.log(`❌ Invalid stream key format: ${streamKey} - must start with 'nf_' and be at least 10 characters`);
            return false;
          }
          
          console.log(`✅ Stream authorized: ${streamKey}`);
          console.log(`🎉 OBS IS NOW STREAMING LIVE!`);
          return true;
        } else {
          console.log(`❌ Invalid stream path format: ${StreamPath} - expected /live/streamkey`);
          return false;
        }
      } catch (error) {
        console.error(`❌ Error in prePublish handler:`, error);
        return false;
      }
    });

    nms.on('postPublish', (id, StreamPath, args) => {
      try {
        const streamKey = StreamPath && typeof StreamPath === 'string' ? StreamPath.split('/').pop() : 'unknown';
        console.log(`🔴 Stream LIVE: ${streamKey}`);
        if (streamKey !== 'unknown') {
          this.mediaDirectoryManager.createStreamDirectory(streamKey);
        }
      } catch (error) {
        console.error(`❌ Error in postPublish handler:`, error);
      }
    });

    nms.on('donePublish', (id, StreamPath, args) => {
      try {
        const streamKey = StreamPath && typeof StreamPath === 'string' ? StreamPath.split('/').pop() : 'unknown';
        console.log(`⚫ Stream ended: ${streamKey}`);
        if (streamKey !== 'unknown') {
          this.streamManager.removeStream(streamKey);
        }
      } catch (error) {
        console.error(`❌ Error in donePublish handler:`, error);
      }
    });
  }

  setupPlayHandlers(nms) {
    nms.on('prePlay', (id, StreamPath, args) => {
      console.log(`[RTMP] 👁️ Pre-play: ${id} StreamPath=${StreamPath}`);
    });

    nms.on('postPlay', (id, StreamPath, args) => {
      try {
        const streamKey = StreamPath && typeof StreamPath === 'string' ? StreamPath.split('/').pop() : 'unknown';
        console.log(`👁️ Viewer connected to: ${streamKey}`);
        if (streamKey !== 'unknown') {
          this.streamManager.incrementViewerCount(streamKey);
        }
      } catch (error) {
        console.error(`❌ Error in postPlay handler:`, error);
      }
    });

    nms.on('donePlay', (id, StreamPath, args) => {
      try {
        const streamKey = StreamPath && typeof StreamPath === 'string' ? StreamPath.split('/').pop() : 'unknown';
        console.log(`👁️ Viewer disconnected from: ${streamKey}`);
        if (streamKey !== 'unknown') {
          this.streamManager.decrementViewerCount(streamKey);
        }
      } catch (error) {
        console.error(`❌ Error in donePlay handler:`, error);
      }
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
