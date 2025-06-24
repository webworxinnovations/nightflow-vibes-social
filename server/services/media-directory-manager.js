
const path = require('path');
const fs = require('fs');

class MediaDirectoryManager {
  constructor(mediaRoot) {
    this.mediaRoot = mediaRoot || '/tmp/media';
  }

  setupDirectories() {
    const liveDir = path.join(this.mediaRoot, 'live');
    
    try {
      if (!fs.existsSync(this.mediaRoot)) {
        fs.mkdirSync(this.mediaRoot, { recursive: true });
        console.log(`✅ Created media root: ${this.mediaRoot}`);
      }
      
      if (!fs.existsSync(liveDir)) {
        fs.mkdirSync(liveDir, { recursive: true });
        console.log(`✅ Created live directory: ${liveDir}`);
      }
      
      console.log(`📁 Media directories ready: ${this.mediaRoot}`);
      console.log(`📁 Live streams directory: ${liveDir}`);
    } catch (error) {
      console.error('❌ Failed to create media directories:', error);
      throw error;
    }
  }

  createStreamDirectory(streamKey) {
    const streamDir = path.join(this.mediaRoot, 'live', streamKey);
    if (!fs.existsSync(streamDir)) {
      fs.mkdirSync(streamDir, { recursive: true });
      console.log(`📁 Created HLS directory: ${streamDir}`);
    }
  }
}

module.exports = MediaDirectoryManager;
