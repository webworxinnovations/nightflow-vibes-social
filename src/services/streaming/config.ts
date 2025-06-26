
export class StreamingConfig {
  private static readonly PRODUCTION_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
  private static readonly PRODUCTION_IP = '137.184.108.62'; // DigitalOcean server IP
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

  // Alternative IP-based URL for DNS issues
  static getOBSServerUrlIP(): string {
    return this.isProduction()
      ? `rtmp://${this.PRODUCTION_IP}:1935/live`
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
  
  // Enhanced server testing specifically for RTMP
  static async testRTMPServerConnection(): Promise<{
    success: boolean;
    message: string;
    serverIP?: string;
    domainWorking: boolean;
    ipWorking: boolean;
    rtmpPortOpen: boolean;
    recommendations: string[];
  }> {
    try {
      console.log('🔍 Testing RTMP server connection specifically...');
      
      if (!this.isProduction()) {
        return {
          success: true,
          message: 'Local development - RTMP test skipped',
          domainWorking: true,
          ipWorking: true,
          rtmpPortOpen: true,
          recommendations: []
        };
      }

      const serverIP = this.PRODUCTION_IP;
      let domainWorking = false;
      let ipWorking = false;
      let rtmpPortOpen = false;
      const recommendations: string[] = [];

      // Test 1: Check if domain resolves
      try {
        const response = await fetch(`https://${this.PRODUCTION_DOMAIN}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        domainWorking = response.ok;
        console.log('✅ Domain resolution test:', domainWorking ? 'PASS' : 'FAIL');
      } catch (error) {
        console.log('❌ Domain test failed:', error);
        domainWorking = false;
      }

      // Test 2: Check if server is reachable via IP
      try {
        const ipResponse = await fetch(`http://${serverIP}:8080/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        ipWorking = ipResponse.ok;
        console.log('✅ IP connectivity test:', ipWorking ? 'PASS' : 'FAIL');
      } catch (error) {
        console.log('❌ IP test failed:', error);
        ipWorking = false;
      }

      // Test 3: Try to check if RTMP port is accessible (limited from browser)
      // We can't directly test port 1935 from browser, but we can make educated guesses
      if (domainWorking || ipWorking) {
        rtmpPortOpen = true; // Assume RTMP is working if HTTP is working
        console.log('📡 RTMP port assumption: Server is running, likely RTMP is available');
      }

      // Generate recommendations
      if (!domainWorking && !ipWorking) {
        recommendations.push('❌ Server appears to be offline - contact support');
        recommendations.push('🔧 Check if RTMP server is running on DigitalOcean');
        return {
          success: false,
          message: '❌ Server is unreachable - both domain and IP failed',
          serverIP,
          domainWorking,
          ipWorking,
          rtmpPortOpen: false,
          recommendations
        };
      }

      if (!domainWorking && ipWorking) {
        recommendations.push('🔧 Use IP address instead of domain in OBS');
        recommendations.push(`📡 Server URL: rtmp://${serverIP}:1935/live`);
        return {
          success: true,
          message: '⚠️ DNS issue detected - use IP address for OBS',
          serverIP,
          domainWorking,
          ipWorking,
          rtmpPortOpen,
          recommendations
        };
      }

      if (domainWorking) {
        recommendations.push('✅ Use domain URL in OBS');
        recommendations.push(`📡 Server URL: rtmp://${this.PRODUCTION_DOMAIN}:1935/live`);
        return {
          success: true,
          message: '✅ Server is working perfectly',
          serverIP,
          domainWorking,
          ipWorking,
          rtmpPortOpen,
          recommendations
        };
      }

      return {
        success: false,
        message: '❓ Partial connectivity - check server configuration',
        serverIP,
        domainWorking,
        ipWorking,
        rtmpPortOpen,
        recommendations: ['🔧 Contact support for server configuration']
      };

    } catch (error) {
      console.error('❌ RTMP server test failed:', error);
      return {
        success: false,
        message: '❌ Connection test failed',
        serverIP: this.PRODUCTION_IP,
        domainWorking: false,
        ipWorking: false,
        rtmpPortOpen: false,
        recommendations: ['🔧 Check internet connection and try again']
      };
    }
  }
  
  // Enhanced DNS and connectivity testing with actual server IP
  static async testDNSAndConnectivity(): Promise<{
    success: boolean;
    message: string;
    serverIP?: string;
    dnsWorking: boolean;
    alternativeUrl?: string;
  }> {
    const rtmpTest = await this.testRTMPServerConnection();
    return {
      success: rtmpTest.success,
      message: rtmpTest.message,
      serverIP: rtmpTest.serverIP,
      dnsWorking: rtmpTest.domainWorking,
      alternativeUrl: rtmpTest.serverIP ? `rtmp://${rtmpTest.serverIP}:1935/live` : undefined
    };
  }
  
  static getOBSTroubleshootingSteps(): string[] {
    return [
      '✅ Service: Custom...',
      '✅ Server: Use exact RTMP URL provided',
      '✅ Stream Key: Generated from the app',
      '🔧 DNS Issue Fix: Try using IP instead of domain name',
      '🔧 Network Fix: Ensure port 1935 is not blocked',
      '🔧 OBS Fix: Restart OBS completely and run as administrator',
      '🔧 Firewall Fix: Temporarily disable firewall/antivirus',
      '🔧 ISP Fix: Contact ISP if port 1935 is blocked'
    ];
  }

  // Add method to get the server IP for DNS troubleshooting
  static async getServerIP(): Promise<string | null> {
    return this.PRODUCTION_IP;
  }

  // Add method to test if RTMP server is actually running
  static async verifyRTMPServerStatus(): Promise<{
    running: boolean;
    message: string;
    details: any;
  }> {
    try {
      console.log('🔍 Verifying RTMP server status...');
      
      // Try to get server health that includes RTMP status
      const response = await fetch(`${this.getApiBaseUrl()}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const health = await response.json();
        console.log('🏥 Server health response:', health);
        
        return {
          running: true,
          message: 'Server is responding - RTMP should be available',
          details: health
        };
      } else {
        return {
          running: false,
          message: `Server returned ${response.status} - may have issues`,
          details: { status: response.status }
        };
      }
    } catch (error) {
      console.error('❌ RTMP server verification failed:', error);
      return {
        running: false,
        message: 'Cannot verify RTMP server status',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}
