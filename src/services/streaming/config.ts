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
    
    // FIXED: Use direct IP or ensure hostname resolves properly
    // Try with direct hostname - DigitalOcean should resolve this
    return `rtmp://${this.DIGITALOCEAN_URL}:1935/live`;
  }
  
  // Get the OBS server URL (without /live - OBS adds this automatically) 
  static getOBSServerUrl(): string {
    if (this.isDevelopment()) {
      return 'rtmp://localhost:1935';
    }
    
    // This is what goes in OBS Server field - WITHOUT /live
    // Try direct hostname resolution
    return `rtmp://${this.DIGITALOCEAN_URL}:1935`;
  }
  
  // Alternative RTMP URL using IP if hostname fails
  static getAlternativeRtmpUrl(): string {
    // Get the app's IP directly from DigitalOcean
    // We'll need to update this with the actual IP
    return `rtmp://164.90.242.104:1935`; // This would be your app's IP
  }
  
  // Keep fallback for legacy purposes
  static getFallbackRtmpUrl(): string {
    return this.getRtmpUrl();
  }
  
  static getHlsUrl(streamKey: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }
  
  // Fixed WebSocket URL to use DigitalOcean
  static getWebSocketUrl(streamKey: string): string {
    if (this.isDevelopment()) {
      return `ws://localhost:3001/ws/stream/${streamKey}`;
    }
    return `wss://${this.DIGITALOCEAN_URL}/ws/stream/${streamKey}`;
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
  static getPortInfo(): { rtmpPort: number; description: string; compatibility: string; troubleshooting: string } {
    return {
      rtmpPort: 1935,
      description: "Standard RTMP Port (1935) - Maximum OBS Compatibility",
      compatibility: "Works with ALL versions of OBS Studio - the most compatible option",
      troubleshooting: "If OBS shows 'hostname not found', your network may be blocking RTMP connections"
    };
  }

  // Get protocol info for UI display
  static getProtocolInfo(): { protocol: string; secure: boolean; description: string; troubleshoot: string } {
    return {
      protocol: "RTMP",
      secure: false,
      description: "Standard RTMP protocol - maximum OBS compatibility, NO SSL",
      troubleshoot: "If connection fails, try: 1) Check firewall, 2) Try different network, 3) Contact ISP about RTMP blocking"
    };
  }

  // Get connection troubleshooting steps
  static getTroubleshootingSteps(): string[] {
    return [
      "1. Make sure you're using the exact server URL without /live",
      "2. Check if your network/ISP blocks RTMP (port 1935)",
      "3. Try connecting from a different network (mobile hotspot)",
      "4. Verify the DigitalOcean app is running and accessible",
      "5. Contact your internet provider if RTMP is blocked"
    ];
  }
}
