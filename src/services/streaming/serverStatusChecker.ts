
export class ServerStatusChecker {
  private static readonly DROPLET_IP = '67.205.179.77';
  // Use HTTPS for production, HTTP for development
  private static readonly PROTOCOL = window.location.protocol === 'https:' ? 'https' : 'http';
  private static readonly SERVER_BASE_URL = `${this.PROTOCOL}://${this.DROPLET_IP}:3001`;

  static async checkStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }> {
    console.log('🔍 Testing DigitalOcean droplet server connectivity...');
    console.log(`📡 Testing server at: ${this.SERVER_BASE_URL}/health`);
    console.log(`🔒 Protocol: ${this.PROTOCOL} (based on page protocol: ${window.location.protocol})`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Try HTTPS first if we're on HTTPS, then fallback to HTTP
      let response;
      try {
        response = await fetch(`${this.SERVER_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal,
          mode: 'cors'
        });
      } catch (httpsError) {
        console.warn('🔒 HTTPS connection failed, trying HTTP fallback...');
        if (this.PROTOCOL === 'https') {
          // Fallback to HTTP if HTTPS fails
          const httpUrl = `http://${this.DROPLET_IP}:3001/health`;
          response = await fetch(httpUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal,
            mode: 'cors'
          });
        } else {
          throw httpsError;
        }
      }

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
        console.warn('⚠️ DigitalOcean droplet responded but with error status:', response.status);
        return { available: false, url: this.SERVER_BASE_URL };
      }
    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity test failed:', error);
      console.error('💡 MIXED CONTENT ISSUE - Using HTTPS to access HTTP server');
      console.error('🔥 SOLUTION: Either enable HTTPS on droplet or use HTTP frontend');
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
    // For HLS streaming, we need to handle mixed content
    const protocol = window.location.protocol === 'https:' ? 'http' : 'http';
    return `${protocol}://${this.DROPLET_IP}:3001/live`;
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static async checkPortAccessibility(port: number): Promise<boolean> {
    try {
      const protocol = window.location.protocol === 'https:' ? 'http' : 'http';
      const response = await fetch(`${protocol}://${this.DROPLET_IP}:${port}/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      console.error(`❌ Port ${port} not accessible:`, error);
      return false;
    }
  }
}
