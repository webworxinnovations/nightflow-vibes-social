
export class StreamingConfig {
  // Railway production URL - your server is actually running here
  private static RAILWAY_URL = 'nightflow-vibes-social-production.up.railway.app';
  
  static getBaseUrl(): string {
    if (this.isDevelopment()) {
      return 'http://localhost:3001';
    }
    return `https://${this.RAILWAY_URL}`;
  }
  
  static getRtmpUrl(): string {
    if (this.isDevelopment()) {
      return 'rtmp://localhost:1935/live';
    }
    // Use port 443 for RTMP - this bypasses most firewalls since 443 is the HTTPS port
    return `rtmp://${this.RAILWAY_URL}:443/live`;
  }
  
  static getHlsUrl(streamKey: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }
  
  static generateStreamKey(userId: string): string {
    // Generate a simple stream key format
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const streamKey = `nf_${userId.substring(0, 8)}_${timestamp}_${randomString}`;
    console.log('StreamingConfig: Generated stream key:', streamKey);
    return streamKey;
  }
  
  static isDevelopment(): boolean {
    // Force production mode for now - the Lovable environment should always use Railway
    const hostname = window.location.hostname;
    console.log('StreamingConfig: Current hostname:', hostname);
    
    // Only consider it development if explicitly running on localhost
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    console.log('StreamingConfig: Is development?', isDev);
    
    return isDev;
  }
  
  static isProduction(): boolean {
    return !this.isDevelopment();
  }

  // Get user-friendly port info for troubleshooting
  static getPortInfo(): { rtmpPort: number; description: string; compatibility: string } {
    const isProduction = this.isProduction();
    
    if (isProduction) {
      return {
        rtmpPort: 443,
        description: "HTTPS Port (443) - Maximum Compatibility",
        compatibility: "Works on 99% of networks including Xfinity, Comcast, public WiFi, and venue networks"
      };
    } else {
      return {
        rtmpPort: 1935,
        description: "Standard RTMP Port (1935) - Development Only",
        compatibility: "May be blocked on restrictive networks"
      };
    }
  }
}
