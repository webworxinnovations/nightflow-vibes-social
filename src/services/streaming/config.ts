export class StreamingConfig {
  // DigitalOcean production URL - your server is now running here
  private static DIGITALOCEAN_URL = 'nightflow-app-wijb2.ondigitalocean.app';
  
  static getBaseUrl(): string {
    if (this.isDevelopment()) {
      return 'http://localhost:3001';
    }
    return `https://${this.DIGITALOCEAN_URL}`;
  }
  
  static getRtmpUrl(): string {
    if (this.isDevelopment()) {
      return 'rtmp://localhost:1935/live';
    }
    
    // FIXED: Return the complete RTMP URL that the server expects
    return `rtmp://${this.DIGITALOCEAN_URL}:1935/live`;
  }
  
  // Get the OBS server URL (without /live - OBS adds this automatically)
  static getOBSServerUrl(): string {
    if (this.isDevelopment()) {
      return 'rtmp://localhost:1935';
    }
    
    // This is what goes in OBS Server field - WITHOUT /live
    return `rtmp://${this.DIGITALOCEAN_URL}:1935`;
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
    // Force production mode for now - the Lovable environment should always use DigitalOcean
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
      description: "Standard RTMP Port (1935) - Maximum OBS Compatibility",
      compatibility: "Works with ALL versions of OBS Studio - the most compatible option"
    };
  }

  // Get protocol info for UI display
  static getProtocolInfo(): { protocol: string; secure: boolean; description: string } {
    return {
      protocol: "RTMP",
      secure: false,
      description: "Standard RTMP protocol - maximum OBS compatibility, NO SSL"
    };
  }
}
