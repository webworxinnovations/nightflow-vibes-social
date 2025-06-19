
export class StreamingConfig {
  // Use your confirmed Railway URL
  private static getEnvironmentUrl(): string {
    const hostname = window.location.hostname;
    
    // Production detection - use your Railway URL
    if (hostname.includes('lovable.app') || hostname === 'localhost') {
      return 'https://nightflow-vibes-social-production.up.railway.app';
    }
    
    // Fallback to environment variable or your Railway URL
    return import.meta.env.VITE_STREAMING_SERVER_URL || 'https://nightflow-vibes-social-production.up.railway.app';
  }
  
  static getBaseUrl(): string {
    const url = this.getEnvironmentUrl();
    console.log('StreamingConfig: Using Railway URL:', url);
    return url;
  }
  
  static getRtmpUrl(): string {
    // RTMP uses the same domain - Railway handles port mapping internally
    const baseUrl = this.getBaseUrl();
    const domain = baseUrl.replace('https://', '').replace('http://', '');
    const rtmpUrl = `rtmp://${domain}/live`;
    console.log('StreamingConfig: RTMP URL:', rtmpUrl);
    return rtmpUrl;
  }
  
  static getHlsUrl(streamKey: string): string {
    // HLS streams are served through the same domain
    const hlsUrl = `${this.getBaseUrl()}/live/${streamKey}/index.m3u8`;
    console.log('StreamingConfig: HLS URL:', hlsUrl);
    return hlsUrl;
  }
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const userPrefix = userId.slice(0, 8);
    const streamKey = `nf_${userPrefix}_${timestamp}_${randomString}`;
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
