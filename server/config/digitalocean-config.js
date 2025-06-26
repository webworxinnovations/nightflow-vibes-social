
const path = require('path');

class DigitalOceanConfig {
  constructor() {
    // DigitalOcean App Platform configuration
    this.RAILWAY_PORT = process.env.PORT || 3001;
    this.RTMP_PORT = 1935; // Standard RTMP port
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8080;
    
    // DigitalOcean URL from environment or default
    this.DIGITALOCEAN_URL = process.env.DIGITALOCEAN_APP_URL || 'nightflow-app-wijb2.ondigitalocean.app';
    
    // Disable SSL for OBS compatibility but use HTTPS for API
    this.SSL_ENABLED = false;
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`🌊 DigitalOcean Configuration:`);
    console.log(`   HTTP Port: ${this.RAILWAY_PORT}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT}`);
    console.log(`   HLS Port: ${this.HLS_PORT}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   App URL: ${this.DIGITALOCEAN_URL}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  }
  
  getMediaServerConfig() {
    return {
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
  }
  
  getRTMPUrl() {
    return `rtmp://${this.DIGITALOCEAN_URL}:${this.RTMP_PORT}/live`;
  }
  
  getHLSBaseUrl() {
    return `https://${this.DIGITALOCEAN_URL}/live`;
  }
  
  getApiBaseUrl() {
    return `https://${this.DIGITALOCEAN_URL}`;
  }
}

module.exports = DigitalOceanConfig;
