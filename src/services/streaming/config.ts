
export class StreamingConfig {
  private static readonly PRODUCTION_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
  private static readonly LOCAL_DOMAIN = 'localhost';
  
  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }
  
  static getApiBaseUrl(): string {
    return this.isProduction() 
      ? `https://${this.PRODUCTION_DOMAIN}`
      : 'http://localhost:3001';
  }
  
  // This is the CORRECT URL format for OBS Studio
  static getOBSServerUrl(): string {
    return this.isProduction()
      ? `rtmp://${this.PRODUCTION_DOMAIN}:1935/live`
      : 'rtmp://localhost:1935/live';
  }
  
  static getRtmpUrl(): string {
    return this.getOBSServerUrl(); // Same as OBS server URL
  }
  
  static getHlsUrl(streamKey: string): string {
    const baseUrl = this.isProduction() 
      ? `https://${this.PRODUCTION_DOMAIN}`
      : 'http://localhost:8080';
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }
  
  static getWebSocketUrl(streamKey: string): string {
    const protocol = this.isProduction() ? 'wss' : 'ws';
    const domain = this.isProduction() ? this.PRODUCTION_DOMAIN : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
  
  static getTroubleshootingSteps(): string[] {
    return [
      '1. Make sure OBS is running and WebSocket server is enabled',
      '2. In OBS: Tools → WebSocket Server Settings → Enable',
      '3. Check your firewall - allow RTMP traffic on port 1935',
      '4. Try connecting from a different network (mobile hotspot)',
      '5. Restart OBS completely and try again',
      '6. Verify you\'re using the RTMP URL (not HTTP/HTTPS)'
    ];
  }
}
