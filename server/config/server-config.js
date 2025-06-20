
const path = require('path');

class ServerConfig {
  constructor() {
    // Railway assigns the PORT dynamically for HTTP
    this.RAILWAY_PORT = process.env.PORT || 3001;
    
    // For Railway, we need to be more careful about ports
    // Railway might not allow RTMP on port 1935, let's try to use the main port
    this.RTMP_PORT = parseInt(process.env.RTMP_PORT) || 1935;
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8888;
    
    // Media storage - use /tmp on Railway
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 Server Configuration:`);
    console.log(`   Railway HTTP Port: ${this.RAILWAY_PORT} (Railway assigned)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (for OBS connections)`);
    console.log(`   HLS Port: ${this.HLS_PORT} (for video playback)`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check if we're on Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log(`🚄 Running on Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      console.log(`🚄 Railway Service ID: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`);
    }
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
  
  // Get the actual RTMP URL that OBS should use
  getRTMPUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // On Railway, use the public domain
      return 'rtmp://nightflow-vibes-social-production.up.railway.app/live';
    } else {
      // Local development
      return `rtmp://localhost:${this.RTMP_PORT}/live`;
    }
  }
  
  // Get the HLS base URL for video playback
  getHLSBaseUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // On Railway, use the HTTPS domain
      return 'https://nightflow-vibes-social-production.up.railway.app/live';
    } else {
      // Local development
      return `http://localhost:${this.HLS_PORT}/live`;
    }
  }
}

module.exports = ServerConfig;
