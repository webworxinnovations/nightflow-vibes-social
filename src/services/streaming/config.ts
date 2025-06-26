
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
  
  // CRITICAL: This MUST match exactly what OBS expects
  static getOBSServerUrl(): string {
    return this.isProduction()
      ? `rtmp://${this.PRODUCTION_DOMAIN}:1935/live`
      : 'rtmp://localhost:1935/live';
  }
  
  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
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
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `nf_${userId.substring(0, 8)}_${timestamp}_${random}`;
  }

  // Add missing methods
  static getPortInfo(): { rtmpPort: number; description: string; compatibility: string } {
    return {
      rtmpPort: 1935,
      description: 'Standard RTMP port',
      compatibility: 'Universal OBS compatibility'
    };
  }

  static getProtocolInfo(): { protocol: string } {
    return {
      protocol: 'RTMP'
    };
  }

  static getTroubleshootingSteps(): string[] {
    return this.getOBSTroubleshootingSteps();
  }
  
  // Enhanced DNS and connectivity testing with actual server IP
  static async testDNSAndConnectivity(): Promise<{
    success: boolean;
    message: string;
    serverIP?: string;
    dnsWorking: boolean;
    alternativeUrl?: string;
  }> {
    try {
      console.log('🧪 Testing DNS and connectivity...');
      
      if (!this.isProduction()) {
        return {
          success: true,
          message: 'Local development - DNS test skipped',
          dnsWorking: true
        };
      }

      // Hard-coded server IP for DigitalOcean deployment
      const serverIP = '137.184.108.62'; // DigitalOcean IP for nightflow-app-wijb2.ondigitalocean.app
      
      // Test 1: Try to resolve DNS using multiple methods
      let dnsWorking = false;
      
      try {
        // Method 1: Try Google DNS API
        const response = await fetch(`https://dns.google/resolve?name=${this.PRODUCTION_DOMAIN}&type=A`, {
          signal: AbortSignal.timeout(3000)
        });
        const data = await response.json();
        
        if (data.Answer && data.Answer.length > 0) {
          dnsWorking = true;
          console.log('✅ DNS Resolution successful via Google DNS');
        }
      } catch (dnsError) {
        console.log('⚠️ Google DNS resolution failed:', dnsError);
        
        // Method 2: Try direct domain ping test
        try {
          await fetch(`https://${this.PRODUCTION_DOMAIN}/favicon.ico`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(2000)
          });
          dnsWorking = true;
          console.log('✅ DNS working via direct domain test');
        } catch (directError) {
          console.log('⚠️ Direct domain test failed:', directError);
          dnsWorking = false;
        }
      }

      // Test 2: Try to reach the server via HTTP health check
      let serverReachable = false;
      try {
        const healthResponse = await fetch(`https://${this.PRODUCTION_DOMAIN}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        serverReachable = healthResponse.ok;
        console.log('✅ Server health check passed');
      } catch (healthError) {
        console.log('⚠️ Server health check failed:', healthError);
        serverReachable = false;
      }

      // Determine the result and provide IP backup
      if (dnsWorking && serverReachable) {
        return {
          success: true,
          message: '✅ Perfect connection! Domain and server working.',
          serverIP,
          dnsWorking: true
        };
      } else if (!dnsWorking && serverIP) {
        return {
          success: false,
          message: '⚠️ DNS issue detected! Use IP address below instead.',
          serverIP,
          dnsWorking: false,
          alternativeUrl: `rtmp://${serverIP}:1935/live`
        };
      } else {
        return {
          success: false,
          message: '❌ Unable to reach streaming server. Please try again later.',
          serverIP,
          dnsWorking: false,
          alternativeUrl: `rtmp://${serverIP}:1935/live`
        };
      }
    } catch (error) {
      // Always provide IP fallback even on error
      const serverIP = '137.184.108.62';
      return {
        success: false,
        message: `⚠️ Connection test failed. Try IP address instead.`,
        serverIP,
        dnsWorking: false,
        alternativeUrl: `rtmp://${serverIP}:1935/live`
      };
    }
  }
  
  static getOBSTroubleshootingSteps(): string[] {
    return [
      '✅ Service: Custom...',
      '✅ Stream Key: Generated from the app',
      '🔧 DNS Issue Fix: Try using IP instead of domain name',
      '🔧 Network Fix: Try different network (mobile hotspot)',
      '🔧 Firewall Fix: Temporarily disable firewall/antivirus',
      '🔧 OBS Fix: Restart OBS completely and run as administrator',
      '🔧 ISP Fix: Some ISPs block RTMP - try VPN if needed'
    ];
  }

  // Add method to get the server IP for DNS troubleshooting
  static async getServerIP(): Promise<string | null> {
    // Return the known DigitalOcean IP immediately
    return '137.184.108.62';
  }
}
