
const path = require('path');

class ServerConfig {
  constructor() {
    // Railway assigns the PORT dynamically
    this.RAILWAY_PORT = process.env.PORT || 3001;
    
    // Fixed ports for RTMP and HLS (Railway will handle routing)
    this.RTMP_PORT = 1935;
    this.HLS_PORT = 8888;
    
    // Media storage
    this.mediaRoot = process.env.MEDIA_ROOT || path.join(process.cwd(), 'media');
    
    console.log(`📍 Server Config:`);
    console.log(`   Railway Port: ${this.RAILWAY_PORT}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT}`);
    console.log(`   HLS Port: ${this.HLS_PORT}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
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
      mediaRoot: this.mediaRoot
    };
  }
}

module.exports = ServerConfig;
