const path = require('path');
const fs = require('fs');

class ServerConfig {
  constructor() {
    // DigitalOcean droplet configuration - FIXED TO USE PORT 8888
    this.DROPLET_PORT = process.env.PORT || 8888; // CHANGED FROM 3001 TO 8888
    this.HTTPS_PORT = process.env.HTTPS_PORT || 3443;
    
    // Force standard RTMP port 1935 - DigitalOcean droplet compatible
    this.RTMP_PORT = 1935;
    this.HLS_PORT = 8888; // CHANGED TO USE SAME PORT AS DROPLET_PORT
    
    // Enable SSL for HTTPS support
    this.SSL_ENABLED = process.env.SSL_ENABLED === 'true' || false;
    this.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt';
    this.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key';
    
    // Media storage - use /tmp on DigitalOcean droplet
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 DigitalOcean Droplet Configuration (FIXED):`);
    console.log(`   Droplet IP: 67.205.179.77`);
    console.log(`   HTTP API Port: ${this.DROPLET_PORT} (DigitalOcean Assigned)`); // FIXED
    console.log(`   HTTPS API Port: ${this.HTTPS_PORT}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT}`);
    console.log(`   HLS HTTP Port: ${this.HLS_PORT}`);
    console.log(`   SSL Enabled: ${this.SSL_ENABLED}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: DigitalOcean Droplet (NO RAILWAY)`); // FIXED
    
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
    console.log(`🔧 HLS HTTP server on port ${this.HLS_PORT} - DigitalOcean configuration`);
    return config;
  }
  
  hasSSLCertificates() {
    try {
      return fs.existsSync(this.SSL_CERT_PATH) && fs.existsSync(this.SSL_KEY_PATH);
    } catch (error) {
      return false;
    }
  }
  
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
  
  getRTMPUrl() {
    return `rtmp://67.205.179.77:${this.RTMP_PORT}/live`;
  }
  
  getHLSBaseUrl() {
    if (this.SSL_ENABLED && this.hasSSLCertificates()) {
      return `https://67.205.179.77:${this.HTTPS_PORT}/live`;
    }
    return `http://67.205.179.77:${this.HLS_PORT}/live`;
  }
  
  getApiBaseUrl() {
    if (this.SSL_ENABLED && this.hasSSLCertificates()) {
      return `https://67.205.179.77:${this.HTTPS_PORT}`;
    }
    return `http://67.205.179.77:${this.DROPLET_PORT}`;
  }
}

module.exports = ServerConfig;
