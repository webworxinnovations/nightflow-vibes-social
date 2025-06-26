
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
  
  // Enhanced OBS connection testing
  static async testRTMPConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const rtmpUrl = this.getRtmpUrl();
      console.log('🧪 Testing RTMP connection to:', rtmpUrl);
      
      // Basic URL validation
      if (!rtmpUrl.startsWith('rtmp://')) {
        return {
          success: false,
          message: 'Invalid RTMP URL format'
        };
      }
      
      // Check if domain resolves (basic test)
      const domain = this.PRODUCTION_DOMAIN;
      const isReachable = await this.testDomainReachability(domain);
      
      if (!isReachable) {
        return {
          success: false,
          message: `Cannot reach ${domain} - check internet connection`
        };
      }
      
      return {
        success: true,
        message: 'RTMP server appears reachable - try OBS connection'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  private static async testDomainReachability(domain: string): Promise<boolean> {
    try {
      // Test domain reachability with a simple HTTPS request
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok || response.status < 500;
    } catch (error) {
      console.warn('Domain reachability test failed:', error);
      return false;
    }
  }
  
  static getOBSTroubleshootingSteps(): string[] {
    return [
      '✅ Server URL: rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live',
      '✅ Service: Custom...',
      '✅ Stream Key: Generated from the app',
      '🔧 Try: Restart OBS completely',
      '🔧 Try: Different network (mobile hotspot)',
      '🔧 Try: Disable firewall temporarily',
      '🔧 Try: Run OBS as administrator'
    ];
  }
}
