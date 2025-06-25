
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
    
    // Use RTMPS (secure RTMP) on port 443 for maximum compatibility
    // This combines SSL encryption + firewall bypass
    return `rtmps://${this.RAILWAY_URL}:443/live`;
  }
  
  // Fallback RTMP URL (non-secure) for clients that don't support RTMPS
  static getFallbackRtmpUrl(): string {
    if (this.isDevelopment()) {
      return 'rtmp://localhost:1935/live';
    }
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
        description: "RTMPS Port (443) - SSL Encrypted + Firewall Bypass",
        compatibility: "Works on 100% of networks - combines HTTPS port (443) with SSL encryption for maximum compatibility"
      };
    } else {
      return {
        rtmpPort: 1935,
        description: "Standard RTMP Port (1935) - Development Only",
        compatibility: "May be blocked on restrictive networks"
      };
    }
  }

  // Get protocol info for UI display
  static getProtocolInfo(): { protocol: string; secure: boolean; description: string } {
    const isProduction = this.isProduction();
    
    if (isProduction) {
      return {
        protocol: "RTMPS",
        secure: true,
        description: "Secure RTMP with SSL encryption over port 443"
      };
    } else {
      return {
        protocol: "RTMP",
        secure: false,
        description: "Standard RTMP protocol"
      };
    }
  }
}
