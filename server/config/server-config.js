
const path = require('path');

class ServerConfig {
  constructor() {
    // Railway assigns the PORT dynamically for HTTP
    this.RAILWAY_PORT = process.env.PORT || 3001;
    
    // Force standard RTMP port 1935 - Railway should expose this
    this.RTMP_PORT = 1935;
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8888;
    
    // Disable SSL completely for maximum OBS compatibility
    this.SSL_ENABLED = false;
    this.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/tmp/ssl/cert.pem';
    this.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/tmp/ssl/key.pem';
    
    // Media storage - use /tmp on Railway
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 Server Configuration:`);
    console.log(`   Railway HTTP Port: ${this.RAILWAY_PORT} (Railway assigned)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (FORCED to standard RTMP port)`);
    console.log(`   HLS Port: ${this.HLS_PORT} (for video playback)`);
    console.log(`   SSL Enabled: ${this.SSL_ENABLED} (DISABLED for OBS compatibility)`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check if we're on Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log(`🚄 Running on Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      console.log(`🚄 Railway Service ID: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`);
      console.log(`📡 FORCING standard RTMP on port ${this.RTMP_PORT} for maximum OBS compatibility`);
      console.log(`🎯 This MUST work with ALL versions of OBS Studio`);
    }
  }
  
  getMediaServerConfig() {
    const config = {
      rtmp: {
        port: this.RTMP_PORT,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        allow_origin: '*',
        drop_idle_publisher: 300
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*'
      },
      mediaRoot: this.mediaRoot
    };

    console.log(`🔧 FORCING standard RTMP configuration on port ${this.RTMP_PORT}`);
    console.log(`🔧 NO SSL, NO ENCRYPTION - pure standard RTMP for OBS`);
    return config;
  }
  
  // Get the actual RTMP URL that OBS should use - STANDARD RTMP ONLY
  getRTMPUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // Use standard RTMP on Railway production for OBS compatibility
      return `rtmp://nightflow-vibes-social-production.up.railway.app:${this.RTMP_PORT}/live`;
    } else {
      // Local development - use standard RTMP
      return `rtmp://localhost:${this.RTMP_PORT}/live`;
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
