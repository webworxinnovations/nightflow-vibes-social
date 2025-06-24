

export class StreamingConfig {
  // Replace with your actual DigitalOcean droplet IP
  private static DROPLET_IP = '67.205.179.77'; // Updated with your droplet IP
  
  static getBaseUrl(): string {
    if (this.isDevelopment()) {
      return 'http://localhost:3001';
    }
    return `http://${this.DROPLET_IP}:3001`;
  }
  
  static getRtmpUrl(): string {
    if (this.isDevelopment()) {
      return 'rtmp://localhost:1935/live';
    }
    return `rtmp://${this.DROPLET_IP}:1935/live`;
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
    return window.location.hostname === 'localhost' || import.meta.env.DEV;
  }
  
  static isProduction(): boolean {
    return !this.isDevelopment();
  }
}

