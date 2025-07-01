
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

  static getApiBaseUrl(): string {
    return `http://${this.DROPLET_IP}:${this.HTTP_PORT}`;
  }

  static getOBSServerUrl(): string {
    return `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
  }

  static getRtmpUrl(): string {
    return `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
  }

  static getHLSUrl(streamKey: string): string {
    return `http://${this.DROPLET_IP}:${this.HTTP_PORT}/live/${streamKey}/index.m3u8`;
  }

  static getHlsUrl(streamKey: string): string {
    return this.getHLSUrl(streamKey);
  }

  static getWebSocketUrl(streamKey: string): string {
    return `ws://${this.DROPLET_IP}:${this.HTTP_PORT}/ws/stream/${streamKey}`;
  }

  static isProduction(): boolean {
    return true; // Always production when using actual droplet
  }

  static getPortInfo(): { rtmp: number; http: number; api: number } {
    return {
      rtmp: this.RTMP_PORT,
      http: this.HTTP_PORT,
      api: this.HTTP_PORT
    };
  }

  static getProtocolInfo(): { rtmp: string; http: string; secure: boolean } {
    return {
      rtmp: 'rtmp',
      http: 'http',
      secure: false
    };
  }

  static getOBSSetupInstructions(): { server: string; streamKey: string; settings: string[] } {
    return {
      server: `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`,
      streamKey: 'Generate from NightFlow app',
      settings: [
        'Service: Custom',
        `Server: rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`,
        'Stream Key: [Your generated key]',
        'Output Resolution: 1920x1080',
        'Bitrate: 2500-6000 kbps'
      ]
    };
  }

  static getTroubleshootingSteps(): string[] {
    return [
      'Check if your droplet server is running in PowerShell',
      'Verify OBS is connected (should show "OBS SUCCESSFULLY CONNECTED!")',
      'Make sure firewall allows ports 1935 and 3001',
      'Test stream key generation in NightFlow app',
      'Check browser console for connection errors'
    ];
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

  static async testRTMPConnection(): Promise<{ available: boolean; details: string }> {
    // Since we can't directly test RTMP from browser, we check the API endpoint
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/api/rtmp/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return {
          available: true,
          details: 'RTMP server is accessible'
        };
      } else {
        return {
          available: false,
          details: 'RTMP status endpoint not responding'
        };
      }
    } catch (error) {
      return {
        available: false,
        details: `RTMP test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
