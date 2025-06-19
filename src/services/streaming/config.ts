
export class StreamingConfig {
  private static readonly RAILWAY_URL = 'https://nodejs-production-aa37f.up.railway.app';
  
  static getBaseUrl(): string {
    console.log('StreamingService: Using Railway URL:', this.RAILWAY_URL);
    return this.RAILWAY_URL;
  }
  
  static getRtmpUrl(): string {
    return `rtmp://${this.RAILWAY_URL.replace('https://', '')}/live`;
  }
  
  static getHlsUrl(streamKey: string): string {
    return `${this.RAILWAY_URL}/live/${streamKey}/index.m3u8`;
  }
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const userPrefix = userId.slice(0, 8);
    return `nf_${userPrefix}_${timestamp}_${randomString}`;
  }
}
