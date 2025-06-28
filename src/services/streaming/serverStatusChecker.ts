
export class ServerStatusChecker {
  private static readonly DROPLET_IP = '67.205.179.77'; // Your DigitalOcean droplet IP
  private static readonly SERVER_BASE_URL = `http://${this.DROPLET_IP}:3001`;

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
        console.warn('⚠️ DigitalOcean droplet responded but with error status:', response.status);
        console.warn('💡 Check your droplet deployment: ssh root@67.205.179.77');
        return { available: false, url: this.SERVER_BASE_URL };
      }
    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity test failed:', error);
      console.error('💡 Your droplet server is not responding. Please check:');
      console.error('   1. SSH to droplet: ssh root@67.205.179.77');
      console.error('   2. Check server status: pm2 status');
      console.error('   3. Check server logs: pm2 logs');
      console.error('   4. Restart if needed: pm2 restart all');
      return { available: false, url: this.SERVER_BASE_URL };
    }
  }

  static getServerUrl(): string {
    return this.SERVER_BASE_URL;
  }

  static getRTMPUrl(): string {
    return `rtmp://${this.DROPLET_IP}:1935/live`; // Standard RTMP port on your droplet
  }

  static getHLSBaseUrl(): string {
    return `${this.SERVER_BASE_URL}/live`; // HLS on port 3001 on your droplet
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }
}
