
export class StreamingConfig {
  // Your actual droplet server IP
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly RTMP_PORT = 1935;
  private static readonly HTTP_PORT = 3001;

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static getServerBaseUrl(): string {
    return `http://${this.DROPLET_IP}:${this.HTTP_PORT}`;
  }

  static getOBSServerUrl(): string {
    return `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
  }

  static getHLSUrl(streamKey: string): string {
    return `http://${this.DROPLET_IP}:${this.HTTP_PORT}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    return `ws://${this.DROPLET_IP}:${this.HTTP_PORT}/ws/stream/${streamKey}`;
  }

  static async testDropletConnection(): Promise<{ available: boolean; details: string }> {
    try {
      const response = await fetch(`${this.getServerBaseUrl()}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        return { 
          available: true, 
          details: 'Droplet server is online and responding' 
        };
      } else {
        return { 
          available: false, 
          details: `Droplet server responded with status ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        available: false, 
        details: `Cannot connect to droplet: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}
