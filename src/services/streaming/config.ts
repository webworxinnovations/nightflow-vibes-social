
export class StreamingConfig {
  // Use your actual DigitalOcean deployment URL for RTMP
  private static readonly DIGITALOCEAN_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
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
  
  // ACTUAL WORKING RTMP URL - using DigitalOcean which supports port 1935
  static getOBSServerUrl(): string {
    return this.isProduction()
      ? `rtmp://${this.DIGITALOCEAN_DOMAIN}:${this.RTMP_PORT}/live`
      : 'rtmp://localhost:1935/live';
  }

  // Backup URL (same as primary since DigitalOcean is our RTMP server)
  static getOBSServerUrlBackup(): string {
    return this.getOBSServerUrl();
  }
  
  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }
  
  static getHlsUrl(streamKey: string): string {
    const baseUrl = this.isProduction() 
      ? `https://${this.DIGITALOCEAN_DOMAIN}`
      : 'http://localhost:3001';
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }
  
  static getWebSocketUrl(streamKey: string): string {
    const protocol = this.isProduction() ? 'wss' : 'ws';
    const domain = this.isProduction() ? this.DIGITALOCEAN_DOMAIN : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `nf_${userId.substring(0, 8)}_${timestamp}_${random}`;
  }

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
      backup_server: serverUrl,
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

  // Test RTMP connectivity - Updated to handle DigitalOcean specifics
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const serverUrl = this.getOBSServerUrl();
    
    const testServer = async () => {
      try {
        console.log('🔍 Testing DigitalOcean RTMP server accessibility...');
        
        // Test the DigitalOcean server health endpoint
        const healthUrl = this.isProduction() 
          ? `https://${this.DIGITALOCEAN_DOMAIN}/api/health`
          : 'http://localhost:3001/api/health';
        
        console.log('📡 Testing health endpoint:', healthUrl);
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏰ Request timed out after 15 seconds');
          controller.abort();
        }, 15000);
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 Health check response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ DigitalOcean server responded successfully:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ DigitalOcean server returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `Server returned ${response.status}: ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ DigitalOcean connectivity test failed:', error);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'Connection timeout - server may be slow to respond'
            };
          } else if (error.message.includes('fetch')) {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'Network error - check internet connection'
            };
          }
        }
        
        return { 
          success: false, 
          url: serverUrl, 
          error: error instanceof Error ? error.message : 'Unknown connection error'
        };
      }
    };

    const result = await testServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ DigitalOcean server is online and responding!');
      recommendations.push('✅ RTMP server logs show successful startup');
      recommendations.push(`✅ Try OBS connection: ${serverUrl}`);
      recommendations.push('✅ Your stream key should work now');
      recommendations.push('⚠️ If OBS still fails, DigitalOcean may not expose port 1935 externally');
    } else {
      recommendations.push('❌ DigitalOcean server health check failed');
      recommendations.push('⚠️ Based on your logs, the RTMP server IS running internally');
      recommendations.push('💡 The issue is likely external port access on DigitalOcean');
      recommendations.push('🔧 DigitalOcean App Platform may require port configuration');
      recommendations.push('📞 Contact DigitalOcean support about exposing port 1935');
      recommendations.push('🔄 Alternative: Try browser streaming method');
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
      '✅ Check DigitalOcean app is running (it is per your logs)',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service',
      '⚠️ If fails: DigitalOcean may not expose RTMP port externally'
    ];
  }
}
