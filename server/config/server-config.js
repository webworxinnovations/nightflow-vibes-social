
const path = require('path');
const fs = require('fs');

class ServerConfig {
  constructor() {
    // RAILWAY CRITICAL: Use Railway's assigned port for API, different ports for media services
    this.RAILWAY_PORT = process.env.PORT || 3000;
    this.RTMP_PORT = 1935; // Standard RTMP port
    this.HLS_PORT = 8888; // Different port to avoid conflicts
    
    // Ensure media directory exists
    this.mediaRoot = path.join(__dirname, '..', 'media');
    if (!fs.existsSync(this.mediaRoot)) {
      fs.mkdirSync(this.mediaRoot, { recursive: true });
    }
    
    this.logConfiguration();
  }
  
  logConfiguration() {
    console.log(`🔧 Port Configuration:`);
    console.log(`   - Railway API Port: ${this.RAILWAY_PORT}`);
    console.log(`   - RTMP Port: ${this.RTMP_PORT}`);
    console.log(`   - HLS Port: ${this.HLS_PORT}`);
  }
  
  getMediaServerConfig() {
    return {
      rtmp: {
        port: this.RTMP_PORT,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*'
      },
      relay: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            mode: 'push',
            edge: `rtmp://127.0.0.1:${this.RTMP_PORT}/hls`
          }
        ]
      }
    };
  }
}

module.exports = ServerConfig;
