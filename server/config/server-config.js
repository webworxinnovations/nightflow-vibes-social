
const path = require('path');

class ServerConfig {
  constructor() {
    // DigitalOcean droplet configuration - DROPLET ONLY
    this.DROPLET_PORT = process.env.PORT || 3001; // Renamed from RAILWAY_PORT
    
    // Force standard RTMP port 1935 - DigitalOcean droplet compatible
    this.RTMP_PORT = 1935;
    this.HLS_PORT = 3001; // Use port 3001 for HLS to match frontend expectations
    
    // Disable SSL completely for maximum OBS compatibility
    this.SSL_ENABLED = false;
    this.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/tmp/ssl/cert.pem';
    this.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/tmp/ssl/key.pem';
    
    // Media storage - use /tmp on DigitalOcean droplet
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 DigitalOcean Droplet Configuration:`);
    console.log(`   Droplet IP: 67.205.179.77`);
    console.log(`   HTTP API Port: ${this.DROPLET_PORT}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT}`);
    console.log(`   HLS HTTP Port: ${this.HLS_PORT}`);
    console.log(`   SSL Enabled: ${this.SSL_ENABLED}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: DigitalOcean Droplet ONLY`);
    
    console.log(`📡 RTMP URL: rtmp://67.205.179.77:${this.RTMP_PORT}/live`);
    console.log(`🎯 HLS URL: http://67.205.179.77:${this.HLS_PORT}/live`);
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

    console.log(`🔧 RTMP configuration on port ${this.RTMP_PORT}`);
    console.log(`🔧 HLS HTTP server on port ${this.HLS_PORT}`);
    console.log(`🔧 NO SSL, NO ENCRYPTION - pure standard RTMP + HTTP for OBS`);
    return config;
  }
  
  // Get the actual RTMP URL that OBS should use - DROPLET IP ONLY
  getRTMPUrl() {
    return `rtmp://67.205.179.77:${this.RTMP_PORT}/live`;
  }
  
  // Get the HLS base URL for video playback - DROPLET IP ONLY
  getHLSBaseUrl() {
    return `http://67.205.179.77:${this.HLS_PORT}/live`;
  }
}

module.exports = ServerConfig;
