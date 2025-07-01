
const path = require('path');
const fs = require('fs');

class ServerConfig {
  constructor() {
    // DigitalOcean droplet configuration with HTTPS support
    this.DROPLET_PORT = process.env.PORT || 3001;
    this.HTTPS_PORT = process.env.HTTPS_PORT || 3443; // HTTPS port
    
    // Force standard RTMP port 1935 - DigitalOcean droplet compatible
    this.RTMP_PORT = 1935;
    this.HLS_PORT = 3001; // Use port 3001 for HLS to match frontend expectations - FIXED: Use droplet port
    
    // Enable SSL for HTTPS support
    this.SSL_ENABLED = process.env.SSL_ENABLED === 'true' || false;
    this.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt';
    this.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key';
    
    // Media storage - use /tmp on DigitalOcean droplet
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 DigitalOcean Droplet Configuration:`);
    console.log(`   Droplet IP: 67.205.179.77`);
    console.log(`   HTTP API Port: ${this.DROPLET_PORT}`);
    console.log(`   HTTPS API Port: ${this.HTTPS_PORT}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT}`);
    console.log(`   HLS HTTP Port: ${this.HLS_PORT}`);
    console.log(`   SSL Enabled: ${this.SSL_ENABLED}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: DigitalOcean Droplet with HTTPS support`);
    
    if (this.SSL_ENABLED) {
      console.log(`🔒 HTTPS URLs:`);
      console.log(`   API: https://67.205.179.77:${this.HTTPS_PORT}`);
      console.log(`   HLS: https://67.205.179.77:${this.HTTPS_PORT}/live`);
    }
    
    console.log(`📡 RTMP URL: rtmp://67.205.179.77:${this.RTMP_PORT}/live`);
    console.log(`📺 HLS URL: http://67.205.179.77:${this.HLS_PORT}/live`);
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
    console.log(`🔧 HLS HTTP server on port ${this.HLS_PORT} - serving to DigitalOcean IP`);
    return config;
  }
  
  // Check if SSL certificates exist
  hasSSLCertificates() {
    try {
      return fs.existsSync(this.SSL_CERT_PATH) && fs.existsSync(this.SSL_KEY_PATH);
    } catch (error) {
      return false;
    }
  }
  
  // Get SSL options for HTTPS server
  getSSLOptions() {
    if (!this.hasSSLCertificates()) {
      console.warn('⚠️ SSL certificates not found. HTTPS will not be available.');
      return null;
    }
    
    try {
      return {
        key: fs.readFileSync(this.SSL_KEY_PATH),
        cert: fs.readFileSync(this.SSL_CERT_PATH)
      };
    } catch (error) {
      console.error('❌ Failed to read SSL certificates:', error);
      return null;
    }
  }
  
  // Get the actual RTMP URL that OBS should use - DROPLET IP ONLY
  getRTMPUrl() {
    return `rtmp://67.205.179.77:${this.RTMP_PORT}/live`;
  }
  
  // FIXED: Get the HLS base URL for video playback using DigitalOcean IP
  getHLSBaseUrl() {
    if (this.SSL_ENABLED && this.hasSSLCertificates()) {
      return `https://67.205.179.77:${this.HTTPS_PORT}/live`;
    }
    return `http://67.205.179.77:${this.HLS_PORT}/live`;
  }
  
  // Get API base URL - HTTPS if available
  getApiBaseUrl() {
    if (this.SSL_ENABLED && this.hasSSLCertificates()) {
      return `https://67.205.179.77:${this.HTTPS_PORT}`;
    }
    return `http://67.205.179.77:${this.DROPLET_PORT}`;
  }
}

module.exports = ServerConfig;
