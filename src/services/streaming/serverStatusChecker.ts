
export class ServerStatusChecker {
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly SERVER_BASE_URL = `http://${this.DROPLET_IP}:3001`;

  static async checkStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }> {
    console.log('🔍 Testing DigitalOcean droplet server connectivity...');
    console.log(`📡 Testing server at: ${this.SERVER_BASE_URL}/health`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout

      const response = await fetch(`${this.SERVER_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
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
        console.warn('💡 Server is running but port 3001 may not be accessible from outside');
        return { available: false, url: this.SERVER_BASE_URL };
      }
    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity test failed:', error);
      console.error('💡 DROPLET FIREWALL ISSUE - Server is running but ports not accessible');
      console.error('🔥 SOLUTION: Configure firewall on your droplet:');
      console.error('   1. SSH: ssh root@67.205.179.77');
      console.error('   2. Allow ports: ufw allow 3001 && ufw allow 1935');
      console.error('   3. Check status: ufw status');
      console.error('   4. Restart server: pm2 restart nightflow-streaming');
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
    return `${this.SERVER_BASE_URL}/live`;
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  // New method to check individual ports
  static async checkPortAccessibility(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://${this.DROPLET_IP}:${port}/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error(`❌ Port ${port} not accessible:`, error);
      return false;
    }
  }
}
