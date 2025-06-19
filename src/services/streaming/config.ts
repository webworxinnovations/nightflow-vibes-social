
export class StreamingConfig {
  // Railway production URL - confirmed from deployment logs
  private static readonly RAILWAY_URL = 'https://nodejs-production-aa37f.up.railway.app';
  
  static getBaseUrl(): string {
    console.log('StreamingService: Using Railway URL:', this.RAILWAY_URL);
    return this.RAILWAY_URL;
  }
  
  static getRtmpUrl(): string {
    // For Railway RTMP streaming, use the domain without https
    const domain = this.RAILWAY_URL.replace('https://', '');
    const rtmpUrl = `rtmp://${domain}/live`;
    console.log('StreamingService: RTMP URL:', rtmpUrl);
    return rtmpUrl;
  }
  
  static getHlsUrl(streamKey: string): string {
    const hlsUrl = `${this.RAILWAY_URL}/live/${streamKey}/index.m3u8`;
    console.log('StreamingService: HLS URL:', hlsUrl);
    return hlsUrl;
  }
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const userPrefix = userId.slice(0, 8);
    const streamKey = `nf_${userPrefix}_${timestamp}_${randomString}`;
    console.log('StreamingService: Generated stream key:', streamKey);
    return streamKey;
  }
}
