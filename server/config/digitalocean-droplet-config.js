
const path = require('path');

class DigitalOceanDropletConfig {
  constructor() {
    this.isDropletEnvironment = !!process.env.DIGITALOCEAN_APP_URL;
    this.dropletIP = '67.205.179.77';
    this.dropletDomain = 'nightflow-app-wijb2.ondigitalocean.app';
  }

  getEnvironmentConfig() {
    return {
      isProduction: true,
      isDroplet: this.isDropletEnvironment,
      dropletIP: this.dropletIP,
      dropletDomain: this.dropletDomain,
      mediaRoot: '/var/www/nightflow-server/media',
      
      // Server ports
      httpPort: process.env.PORT || 3001,
      rtmpPort: 1935,
      hlsPort: 9001,
      
      // URLs
      apiBaseUrl: `https://${this.dropletDomain}`,
      rtmpUrl: `rtmp://${this.dropletIP}:1935/live`,
      hlsBaseUrl: `http://${this.dropletIP}:9001`,
      
      // CORS settings
      corsOrigins: [
        `https://${this.dropletDomain}`,
        'http://localhost:5173',
        'http://localhost:3000'
      ]
    };
  }

  getMediaServerConfig() {
    const config = this.getEnvironmentConfig();
    
    return {
      rtmp: {
        port: config.rtmpPort,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
        listen: '0.0.0.0', // Bind to all interfaces for external access
        allow_origin: '*'
      },
      http: {
        port: config.hlsPort,
        allow_origin: '*',
        mediaroot: config.mediaRoot,
        listen: '0.0.0.0' // Bind to all interfaces
      },
      relay: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            mode: 'push',
            edge: `rtmp://127.0.0.1:${config.rtmpPort}/live`
          }
        ]
      }
    };
  }

  getExpressConfig() {
    const config = this.getEnvironmentConfig();
    
    return {
      port: config.httpPort,
      cors: {
        origin: config.corsOrigins,
        credentials: true
      },
      static: {
        mediaPath: config.mediaRoot,
        maxAge: '1h'
      }
    };
  }
}

module.exports = DigitalOceanDropletConfig;
