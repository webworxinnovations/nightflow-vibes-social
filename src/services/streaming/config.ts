
export class StreamingConfig {
  // Use our actual Railway deployment for RTMP
  private static getEnvironmentUrl(): string {
    return 'https://nightflow-vibes-social-production.up.railway.app';
  }
  
  static getBaseUrl(): string {
    return 'https://nightflow-vibes-social-production.up.railway.app';
  }
  
  static getRtmpUrl(): string {
    // Railway TCP proxy should expose port 1935 on the same domain
    return 'rtmp://nightflow-vibes-social-production.up.railway.app:1935/live';
  }
  
  static getHlsUrl(streamKey: string): string {
    return `${this.getBaseUrl()}/live/${streamKey}/index.m3u8`;
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
    return window.location.hostname === 'localhost' || import.meta.env.DEV;
  }
  
  static isProduction(): boolean {
    return !this.isDevelopment();
  }
}
