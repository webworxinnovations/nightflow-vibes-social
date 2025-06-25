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
    
    // FORCE standard RTMP on port 1935 for maximum OBS compatibility
    return `rtmp://${this.RAILWAY_URL}:1935/live`;
  }
  
  // Keep fallback for legacy purposes
  static getFallbackRtmpUrl(): string {
    return this.getRtmpUrl();
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
    return {
      rtmpPort: 1935,
      description: "FORCED Standard RTMP Port (1935) - Maximum OBS Compatibility",
      compatibility: "Works with ALL versions of OBS Studio - the most compatible option"
    };
  }

  // Get protocol info for UI display
  static getProtocolInfo(): { protocol: string; secure: boolean; description: string } {
    return {
      protocol: "RTMP",
      secure: false,
      description: "FORCED standard RTMP protocol - maximum OBS compatibility, NO SSL"
    };
  }
}
