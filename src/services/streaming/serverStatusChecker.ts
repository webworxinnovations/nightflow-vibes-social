
export class ServerStatusChecker {
  // Use your actual droplet IP where the server is running
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly SERVER_BASE_URL = `https://${this.DROPLET_IP}:3443`;

  static async checkStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }> {
    console.log('🔍 Testing your actual droplet server connectivity...');
    console.log(`📡 Testing server at: ${this.SERVER_BASE_URL}/health`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.SERVER_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('✅ Your droplet server is online and responding!');
        
        return {
          available: true,
          url: this.SERVER_BASE_URL,
          version: data.version || 'unknown',
          uptime: data.uptime || 0
        };
      } else {
        console.warn('⚠️ Droplet responded but with error status:', response.status);
        return { available: false, url: this.SERVER_BASE_URL };
      }
    } catch (error) {
      console.error('❌ Droplet connectivity test failed:', error);
      console.error('💡 Make sure your server is still running in PowerShell');
      return { available: false, url: this.SERVER_BASE_URL };
    }
  }

  static getServerUrl(): string {
    return this.SERVER_BASE_URL;
  }

  static getRTMPUrl(): string {
    return `rtmp://${this.DROPLET_IP}:1935/live`;
  }

  static getHLSBaseUrl(): string {
    return `https://${this.DROPLET_IP}:3443/live`;
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static async checkPortAccessibility(port: number): Promise<boolean> {
    try {
      const protocol = port === 3443 ? 'https' : 'http';
      const response = await fetch(`${protocol}://${this.DROPLET_IP}:${port}/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      console.error(`❌ Port ${port} not accessible on droplet:`, error);
      return false;
    }
  }
}
