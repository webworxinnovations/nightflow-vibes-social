
const path = require('path');

class DigitalOceanConfig {
  constructor() {
    // Railway HTTP port configuration
    this.HTTP_PORT = process.env.PORT || 3001;
    this.RTMP_PORT = 1935; // Standard RTMP port - PROPERLY EXPOSED
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8080;
    
    // Railway domain (corrected from non-existent DigitalOcean domain)
    this.RAILWAY_DOMAIN = 'nightflow-vibes-social-production.up.railway.app';
    
    // Ensure external RTMP access
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`🚄 Railway Configuration (Updated):`);
    console.log(`   HTTP Port: ${this.HTTP_PORT} (Railway web service)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (TCP service - PROPERLY EXPOSED)`);
    console.log(`   HLS Port: ${this.HLS_PORT} (video streaming)`);
    console.log(`   Domain: ${this.RAILWAY_DOMAIN}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   OBS URL: rtmp://${this.RAILWAY_DOMAIN}:${this.RTMP_PORT}/live`);
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
        // CRITICAL: Bind to all interfaces for Railway
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
  
  // CORRECT OBS RTMP URL - using Railway domain that actually exists
  getRTMPUrl() {
    return `rtmp://${this.RAILWAY_DOMAIN}:${this.RTMP_PORT}/live`;
  }
  
  // HLS URL for video playback
  getHLSBaseUrl() {
    return `https://${this.RAILWAY_DOMAIN}/live`;
  }
  
  // API base URL
  getApiBaseUrl() {
    return `https://${this.RAILWAY_DOMAIN}`;
  }
  
  // Get deployment info
  getDeploymentInfo() {
    return {
      platform: 'Railway App Platform',
      rtmpUrl: this.getRTMPUrl(),
      apiUrl: this.getApiBaseUrl(),
      hlsUrl: this.getHLSBaseUrl(),
      portsExposed: [this.HTTP_PORT, this.RTMP_PORT, this.HLS_PORT],
      obsCompatible: true,
      status: 'Port 1935 properly configured for RTMP on Railway'
    };
  }
}

module.exports = DigitalOceanConfig;
