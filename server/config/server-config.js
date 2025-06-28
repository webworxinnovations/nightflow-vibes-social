
const path = require('path');

class ServerConfig {
  constructor() {
    // DigitalOcean droplet configuration
    this.RAILWAY_PORT = process.env.PORT || 3001;
    
    // Force standard RTMP port 1935 - DigitalOcean droplet compatible
    this.RTMP_PORT = 1935;
    this.HLS_PORT = 8080; // FIXED: Force port 8080 for HLS
    
    // Disable SSL completely for maximum OBS compatibility
    this.SSL_ENABLED = false;
    this.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/tmp/ssl/cert.pem';
    this.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/tmp/ssl/key.pem';
    
    // Media storage - use /tmp on DigitalOcean droplet
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 DigitalOcean Droplet Configuration:`);
    console.log(`   HTTP API Port: ${this.RAILWAY_PORT} (DigitalOcean assigned)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (FORCED to standard RTMP port)`);
    console.log(`   HLS HTTP Port: ${this.HLS_PORT} (FORCED for video serving)`);
    console.log(`   SSL Enabled: ${this.SSL_ENABLED} (DISABLED for OBS compatibility)`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    console.log(`🌊 DigitalOcean Droplet IP: 67.205.179.77`);
    console.log(`📡 FORCING standard RTMP on port ${this.RTMP_PORT} for maximum OBS compatibility`);
    console.log(`🎯 FORCING HLS HTTP server on port ${this.HLS_PORT} for video delivery`);
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
        drop_idle_publisher: 300,
        listen: '0.0.0.0' // CRITICAL: Bind to all interfaces
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*',
        listen: '0.0.0.0' // CRITICAL: Bind to all interfaces for HLS
      },
      mediaRoot: this.mediaRoot
    };

    console.log(`🔧 FORCING standard RTMP configuration on port ${this.RTMP_PORT}`);
    console.log(`🔧 FORCING HLS HTTP server on port ${this.HLS_PORT}`);
    console.log(`🔧 NO SSL, NO ENCRYPTION - pure standard RTMP + HTTP for OBS`);
    return config;
  }
  
  // Get the actual RTMP URL that OBS should use - DROPLET IP
  getRTMPUrl() {
    return `rtmp://67.205.179.77:${this.RTMP_PORT}/live`;
  }
  
  // Get the HLS base URL for video playback - DROPLET IP
  getHLSBaseUrl() {
    return `http://67.205.179.77:${this.HLS_PORT}/live`;
  }
}

module.exports = ServerConfig;
