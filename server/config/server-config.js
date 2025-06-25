
const path = require('path');

class ServerConfig {
  constructor() {
    // Railway assigns the PORT dynamically for HTTP
    this.RAILWAY_PORT = process.env.PORT || 3001;
    
    // RTMP port - use 443 to bypass firewalls (HTTPS port is rarely blocked)
    this.RTMP_PORT = parseInt(process.env.RTMP_PORT) || 443;
    this.HLS_PORT = parseInt(process.env.HLS_PORT) || 8888;
    
    // SSL/TLS Configuration for RTMPS
    this.SSL_ENABLED = process.env.SSL_ENABLED === 'true' || process.env.RAILWAY_ENVIRONMENT;
    this.SSL_CERT_PATH = process.env.SSL_CERT_PATH || '/tmp/ssl/cert.pem';
    this.SSL_KEY_PATH = process.env.SSL_KEY_PATH || '/tmp/ssl/key.pem';
    
    // Media storage - use /tmp on Railway
    this.mediaRoot = process.env.MEDIA_ROOT || '/tmp/media';
    
    console.log(`📍 Server Configuration:`);
    console.log(`   Railway HTTP Port: ${this.RAILWAY_PORT} (Railway assigned)`);
    console.log(`   RTMP Port: ${this.RTMP_PORT} (Port 443 - HTTPS port to bypass firewalls)`);
    console.log(`   HLS Port: ${this.HLS_PORT} (for video playback)`);
    console.log(`   SSL Enabled: ${this.SSL_ENABLED} (RTMPS support)`);
    console.log(`   Media Root: ${this.mediaRoot}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check if we're on Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log(`🚄 Running on Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
      console.log(`🚄 Railway Service ID: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`);
      console.log(`🔒 RTMPS (Secure RTMP) enabled on port 443`);
      console.log(`🔐 This provides SSL encryption + firewall bypass`);
      console.log(`🌐 Works on all networks including restrictive WiFi`);
    }
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
        drop_idle_publisher: 300
      },
      http: {
        port: this.HLS_PORT,
        mediaroot: this.mediaRoot,
        allow_origin: '*'
      },
      mediaRoot: this.mediaRoot
    };

    // Add SSL configuration for RTMPS if enabled
    if (this.SSL_ENABLED) {
      config.rtmp.ssl = {
        port: this.RTMP_PORT,
        key: this.SSL_KEY_PATH,
        cert: this.SSL_CERT_PATH
      };
      console.log(`🔒 RTMPS SSL configuration added for port ${this.RTMP_PORT}`);
    }

    return config;
  }
  
  // Get the actual RTMP URL that OBS should use - NOW WITH RTMPS SUPPORT
  getRTMPUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // Use RTMPS (secure RTMP) on Railway production
      if (this.SSL_ENABLED) {
        return `rtmps://nightflow-vibes-social-production.up.railway.app:${this.RTMP_PORT}/live`;
      } else {
        return `rtmp://nightflow-vibes-social-production.up.railway.app:${this.RTMP_PORT}/live`;
      }
    } else {
      // Local development - use standard RTMP
      return `rtmp://localhost:1935/live`;
    }
  }
  
  // Get the HLS base URL for video playback
  getHLSBaseUrl() {
    if (process.env.RAILWAY_ENVIRONMENT) {
      // On Railway, use the HTTPS domain for HLS
      return 'https://nightflow-vibes-social-production.up.railway.app/live';
    } else {
      // Local development
      return `http://localhost:${this.HLS_PORT}/live`;
    }
  }

  // Generate self-signed SSL certificates for RTMPS
  async generateSSLCertificates() {
    const fs = require('fs');
    const { execSync } = require('child_process');
    const sslDir = '/tmp/ssl';

    try {
      // Create SSL directory
      if (!fs.existsSync(sslDir)) {
        fs.mkdirSync(sslDir, { recursive: true });
        console.log('📁 Created SSL directory');
      }

      // Check if certificates already exist
      if (fs.existsSync(this.SSL_CERT_PATH) && fs.existsSync(this.SSL_KEY_PATH)) {
        console.log('🔐 SSL certificates already exist');
        return true;
      }

      console.log('🔐 Generating self-signed SSL certificates for RTMPS...');
      
      // Check if openssl is available
      try {
        execSync('which openssl', { stdio: 'ignore' });
      } catch (error) {
        console.log('❌ OpenSSL not available, disabling SSL');
        return false;
      }
      
      // Generate self-signed certificate for Railway domain
      const domain = 'nightflow-vibes-social-production.up.railway.app';
      const opensslCmd = `openssl req -x509 -newkey rsa:2048 -keyout ${this.SSL_KEY_PATH} -out ${this.SSL_CERT_PATH} -days 365 -nodes -subj "/CN=${domain}"`;
      
      execSync(opensslCmd, { stdio: 'inherit' });
      
      console.log('✅ SSL certificates generated successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to generate SSL certificates:', error.message);
      console.log('⚠️ Falling back to standard RTMP without SSL');
      return false;
    }
  }
}

module.exports = ServerConfig;
