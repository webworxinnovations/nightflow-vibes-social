
const path = require('path');

class RTMPServerConfig {
  constructor() {
    // Use environment-specific configuration
    this.isProduction = process.env.NODE_ENV === 'production';
    this.RTMP_PORT = 1935; // Standard RTMP port
    this.HTTP_PORT = process.env.PORT || 3001;
    this.HLS_PORT = 9001;
    
    // Media storage configuration
    this.mediaRoot = process.env.MEDIA_ROOT || path.join(process.cwd(), 'media');
    
    console.log(`🎯 RTMP Server Configuration:`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (STANDARD RTMP)`);
    console.log(`   HTTP Port: ${this.HTTP_PORT}`);
    console.log(`   HLS Port: ${this.HLS_PORT}`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Production: ${this.isProduction}`);
  }
  
  getNodeMediaServerConfig() {
    return {
      rtmp: {
        port: this.RTMP_PORT,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        allow_origin: '*',
        drop_idle_publisher: 300,
        // Bind to all interfaces for compatibility
        listen: '0.0.0.0'
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*',
        api: true,
        // Bind to all interfaces
        listen: '0.0.0.0'
      },
      auth: {
        api: true,
        api_user: 'admin',
        api_pass: 'nightflow2024',
        play: false,
        publish: false
      },
      relay: {
        ffmpeg: '/usr/local/bin/ffmpeg',
        tasks: []
      }
    };
  }
  
  // Get the RTMP URL for OBS
  getRTMPUrl() {
    if (this.isProduction) {
      return `rtmp://rtmp.nightflow.app:${this.RTMP_PORT}/live`;
    } else {
      return `rtmp://localhost:${this.RTMP_PORT}/live`;
    }
  }
  
  // Get HLS URL for playback
  getHLSBaseUrl() {
    return `http://67.205.179.77:${this.HLS_PORT}/live`;
  }
  
  // Health check endpoint
  getHealthCheckConfig() {
    return {
      rtmp: {
        host: this.isProduction ? 'rtmp.nightflow.app' : 'localhost',
        port: this.RTMP_PORT,
        ready: true
      },
      hls: {
        port: this.HLS_PORT,
        ready: true
      },
      status: 'operational'
    };
  }
}

module.exports = RTMPServerConfig;
