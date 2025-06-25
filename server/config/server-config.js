
const path = require('path');

class ServerConfig {
  constructor() {
    // Railway assigns the PORT dynamically for HTTP
    this.RAILWAY_PORT = process.env.PORT || 3001;
    
    // RTMP port - use 443 to bypass firewalls (HTTPS port is rarely blocked)
    this.RTMP_PORT = parseInt(process.env.RTMP_PORT) || 443;
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8888;
    
    // Media storage - use /tmp on Railway
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 Server Configuration:`);
    console.log(`   Railway HTTP Port: ${this.RAILWAY_PORT} (Railway assigned)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (Port 443 - HTTPS port to bypass firewalls)`);
    console.log(`   HLS Port: ${this.HLS_PORT} (for video playback)`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check if we're on Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log(`🚄 Running on Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      console.log(`🚄 Railway Service ID: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`);
      console.log(`🚄 Using port 443 for RTMP - this bypasses most firewalls!`);
      console.log(`🚄 Most networks allow port 443 since it's used for HTTPS`);
    }
  }
  
  getMediaServerConfig() {
    return {
      rtmp: {
        port: this.RTMP_PORT,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        // Additional configs to help with restrictive networks
        allow_origin: '*',
        chunk_size: 4096, // Smaller chunks work better on restrictive networks
        drop_idle_publisher: 300 // Drop idle connections after 5 minutes
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*'
      },
      mediaRoot: this.mediaRoot
    };
  }
  
  // Get the actual RTMP URL that OBS should use - NOW USING PORT 443
  getRTMPUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // Railway TCP proxy makes port 443 available on the same domain
      return `rtmp://nightflow-vibes-social-production.up.railway.app:${this.RTMP_PORT}/live`;
    } else {
      // Local development - use 1935 for local testing
      return `rtmp://localhost:1935/live`;
    }
  }
  
  // Get the HLS base URL for video playback
  getHLSBaseUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // On Railway, use the HTTPS domain for HLS
      return 'https://nightflow-vibes-social-production.up.railway.app/live';
    } else {
      // Local development
      return `http://localhost:${this.HLS_PORT}/live`;
    }
  }
}

module.exports = ServerConfig;
