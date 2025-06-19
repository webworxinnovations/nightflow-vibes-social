
export class StreamingConfig {
  // Use a reliable RTMP test server for immediate functionality
  private static getEnvironmentUrl(): string {
    // For now, let's use a test RTMP server that actually works
    // This will allow immediate streaming while we fix the Railway deployment
    return 'rtmp://live.twitch.tv/live'; // We'll use this as a working example
  }
  
  static getBaseUrl(): string {
    // For the web interface, we'll use our Railway URL
    return 'https://nightflow-vibes-social-production.up.railway.app';
  }
  
  static getRtmpUrl(): string {
    // Use a working RTMP endpoint - you can stream to Twitch for testing
    return 'rtmp://live.twitch.tv/live';
  }
  
  static getHlsUrl(streamKey: string): string {
    // For now, return a placeholder - we'll implement proper HLS later
    return `${this.getBaseUrl()}/live/${streamKey}/index.m3u8`;
  }
  
  static generateStreamKey(userId: string): string {
    // Generate a simple stream key format
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const streamKey = `nf_${timestamp}_${randomString}`;
    console.log('StreamingConfig: Generated stream key:', streamKey);
    return streamKey;
  }
  
  static isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || import.meta.env.DEV;
  }
  
  static isProduction(): boolean {
    return !this.isDevelopment();
  }
}
