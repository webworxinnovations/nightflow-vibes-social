
const path = require('path');

class DigitalOceanConfig {
  constructor() {
    // DigitalOcean App Platform configuration
    this.RAILWAY_PORT = process.env.PORT || 3001;
    this.RTMP_PORT = 1935; // Standard RTMP port - DigitalOcean supports this
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8080;
    
    // DigitalOcean supports custom TCP ports
    this.SSL_ENABLED = false; // Keep disabled for OBS compatibility
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`🌊 DigitalOcean Configuration:`);
    console.log(`   HTTP Port: ${this.RAILWAY_PORT}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} ✅ (DigitalOcean supports TCP)`);
    console.log(`   HLS Port: ${this.HLS_PORT}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
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
    // DigitalOcean will provide your app URL
    const appUrl = process.env.DIGITALOCEAN_APP_URL || 'your-app.ondigitalocean.app';
    return `rtmp://${appUrl}:${this.RTMP_PORT}/live`;
  }
  
  getHLSBaseUrl() {
    const appUrl = process.env.DIGITALOCEAN_APP_URL || 'your-app.ondigitalocean.app';
    return `https://${appUrl}/live`;
  }
}

module.exports = DigitalOceanConfig;
