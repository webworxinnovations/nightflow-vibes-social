
const path = require('path');

class DigitalOceanConfig {
  constructor() {
    // DigitalOcean App Platform configuration
    this.HTTP_PORT = process.env.PORT || 3001;
    this.RTMP_PORT = 1935; // Standard RTMP port - MUST BE EXPOSED
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8080;
    
    // DigitalOcean App Platform domain
    this.DIGITALOCEAN_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
    
    // Ensure external RTMP access
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`🌊 DigitalOcean App Platform Configuration:`);
    console.log(`   HTTP Port: ${this.HTTP_PORT} (DigitalOcean web service)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (TCP service - MUST BE EXPOSED)`);
    console.log(`   HLS Port: ${this.HLS_PORT} (video streaming)`);
    console.log(`   Domain: ${this.DIGITALOCEAN_DOMAIN}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   OBS URL: rtmp://${this.DIGITALOCEAN_DOMAIN}:${this.RTMP_PORT}/live`);
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
        drop_idle_publisher: 300,
        // CRITICAL: Bind to all interfaces for DigitalOcean App Platform
        listen: '0.0.0.0'
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*',
        // Also bind HTTP to all interfaces
        listen: '0.0.0.0'
      },
      mediaRoot: this.mediaRoot
    };
  }
  
  // CORRECT OBS RTMP URL - using DigitalOcean App Platform domain
  getRTMPUrl() {
    return `rtmp://${this.DIGITALOCEAN_DOMAIN}:${this.RTMP_PORT}/live`;
  }
  
  // HLS URL for video playback
  getHLSBaseUrl() {
    return `https://${this.DIGITALOCEAN_DOMAIN}/live`;
  }
  
  // API base URL
  getApiBaseUrl() {
    return `https://${this.DIGITALOCEAN_DOMAIN}`;
  }
  
  // Get deployment info
  getDeploymentInfo() {
    return {
      platform: 'DigitalOcean App Platform',
      rtmpUrl: this.getRTMPUrl(),
      apiUrl: this.getApiBaseUrl(),
      hlsUrl: this.getHLSBaseUrl(),
      portsExposed: [this.HTTP_PORT, this.RTMP_PORT, this.HLS_PORT],
      obsCompatible: true,
      status: 'Port 1935 configured for RTMP on DigitalOcean App Platform'
    };
  }
}

module.exports = DigitalOceanConfig;
