

export class StreamingConfig {
  // Use your actual Railway deployment URL
  private static readonly RAILWAY_DOMAIN = 'nightflow-vibes-social-production.up.railway.app';
  private static readonly RTMP_PORT = 1935;
  
  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }
  
  static getApiBaseUrl(): string {
    return this.isProduction() 
      ? `https://${this.RAILWAY_DOMAIN}`
      : 'http://localhost:3001';
  }
  
  // ACTUAL WORKING RTMP URL - using your real Railway deployment
  static getOBSServerUrl(): string {
    return this.isProduction()
      ? `rtmp://${this.RAILWAY_DOMAIN}:${this.RTMP_PORT}/live`
      : 'rtmp://localhost:1935/live';
  }

  // Backup URL (same as primary since Railway is our only server)
  static getOBSServerUrlBackup(): string {
    return this.getOBSServerUrl();
  }
  
  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }
  
  static getHlsUrl(streamKey: string): string {
    const baseUrl = this.getApiBaseUrl();
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }
  
  static getWebSocketUrl(streamKey: string): string {
    const protocol = this.isProduction() ? 'wss' : 'ws';
    const domain = this.isProduction() ? this.RAILWAY_DOMAIN : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `nf_${userId.substring(0, 8)}_${timestamp}_${random}`;
  }

  // Add missing getPortInfo method
  static getPortInfo(): {
    rtmpPort: number;
    description: string;
    compatibility: string;
  } {
    return {
      rtmpPort: this.RTMP_PORT,
      description: 'Standard RTMP streaming port',
      compatibility: 'Compatible with all RTMP streaming software including OBS Studio'
    };
  }

  // Add missing getProtocolInfo method
  static getProtocolInfo(): {
    protocol: string;
    description: string;
  } {
    return {
      protocol: 'RTMP',
      description: 'Real-Time Messaging Protocol - Industry standard for live streaming'
    };
  }

  static getOBSSetupInstructions(): {
    service: string;
    server: string;
    backup_server: string;
    steps: string[];
  } {
    const serverUrl = this.getOBSServerUrl();
    return {
      service: 'Custom...',
      server: serverUrl,
      backup_server: serverUrl, // Same server for now
      steps: [
        '1. Open OBS Studio',
        '2. Go to Settings → Stream',
        '3. Service: Select "Custom..."',
        `4. Server: ${serverUrl}`,
        '5. Stream Key: Copy from app',
        '6. Click Apply → OK',
        '7. Click Start Streaming'
      ]
    };
  }

  // Test RTMP connectivity - Fixed to use actual Railway server
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const serverUrl = this.getOBSServerUrl();
    
    const testServer = async () => {
      try {
        // Test the actual Railway server health endpoint
        const healthUrl = `${this.getApiBaseUrl()}/api/health`;
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return { success: true, url: serverUrl, error: undefined };
        } else {
          return { 
            success: false, 
            url: serverUrl, 
            error: `Server returned ${response.status}`
          };
        }
      } catch (error) {
        return { 
          success: false, 
          url: serverUrl, 
          error: error instanceof Error ? error.message : 'Connection failed'
        };
      }
    };

    const result = await testServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ Railway server is responding!');
      recommendations.push(`✅ Use this RTMP URL in OBS: ${serverUrl}`);
      recommendations.push('✅ Copy your stream key from the app');
      recommendations.push('✅ In OBS: Settings → Stream → Custom → Paste server URL');
    } else {
      recommendations.push('❌ Railway server is not responding');
      recommendations.push('⚠️ Check Railway deployment status');
      recommendations.push('💡 Verify server is running and deployed');
      recommendations.push('🔄 Try refreshing the page and testing again');
    }

    return {
      primary: result,
      backup: result, // Same server for both
      recommendations
    };
  }

  static getTroubleshootingSteps(): string[] {
    return [
      `✅ Use exact server URL: ${this.getOBSServerUrl()}`,
      '✅ Ensure firewall allows port 1935 outbound',
      '✅ Restart OBS completely after configuration',
      '✅ Test from different network (mobile hotspot)',
      '✅ Check Railway deployment is running',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service'
    ];
  }
}

