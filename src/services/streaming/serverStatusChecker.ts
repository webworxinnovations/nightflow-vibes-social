
export class ServerStatusChecker {
  private static readonly SERVER_BASE_URL = 'http://67.205.179.77:3001'; // FIXED: Use port 3001

  static async checkStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }> {
    console.log('🔍 Testing DigitalOcean droplet server connectivity...');
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
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('✅ DigitalOcean droplet server is online and responding');
        
        return {
          available: true,
          url: this.SERVER_BASE_URL,
          version: data.version || 'unknown',
          uptime: data.uptime || 0
        };
      } else {
        console.warn('⚠️ Server responded but with error status:', response.status);
        return { available: false, url: this.SERVER_BASE_URL };
      }
    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity test failed:', error);
      return { available: false, url: this.SERVER_BASE_URL };
    }
  }

  static getServerUrl(): string {
    return this.SERVER_BASE_URL;
  }

  static getRTMPUrl(): string {
    return 'rtmp://67.205.179.77:1935/live'; // Standard RTMP port
  }

  static getHLSBaseUrl(): string {
    return `${this.SERVER_BASE_URL}/live`; // HLS on port 3001
  }
}
