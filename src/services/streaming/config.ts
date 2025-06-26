
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
  
  // Enhanced DNS and connectivity testing
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

      // Test 1: Try to resolve DNS
      let serverIP: string | null = null;
      let dnsWorking = false;
      
      try {
        const response = await fetch(`https://dns.google/resolve?name=${this.PRODUCTION_DOMAIN}&type=A`);
        const data = await response.json();
        
        if (data.Answer && data.Answer.length > 0) {
          serverIP = data.Answer[0].data;
          dnsWorking = true;
          console.log('✅ DNS Resolution successful:', serverIP);
        }
      } catch (dnsError) {
        console.log('⚠️ DNS resolution failed:', dnsError);
        dnsWorking = false;
      }

      // Test 2: Try to reach the server via HTTP health check
      let serverReachable = false;
      try {
        const healthResponse = await fetch(`https://${this.PRODUCTION_DOMAIN}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        serverReachable = healthResponse.ok;
      } catch (healthError) {
        console.log('⚠️ Server health check failed:', healthError);
      }

      // Determine the result
      if (dnsWorking && serverReachable) {
        return {
          success: true,
          message: '✅ DNS and server connectivity perfect!',
          serverIP,
          dnsWorking: true
        };
      } else if (!dnsWorking && serverIP) {
        return {
          success: false,
          message: '⚠️ DNS issue detected - use IP address instead',
          serverIP,
          dnsWorking: false,
          alternativeUrl: `rtmp://${serverIP}:1935/live`
        };
      } else {
        return {
          success: false,
          message: '❌ Unable to resolve server address',
          dnsWorking: false
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        dnsWorking: false
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
    try {
      // Use a DNS over HTTPS service to resolve the domain
      const response = await fetch(`https://dns.google/resolve?name=${this.PRODUCTION_DOMAIN}&type=A`);
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        return data.Answer[0].data;
      }
      return null;
    } catch (error) {
      console.error('DNS resolution failed:', error);
      return null;
    }
  }
}
