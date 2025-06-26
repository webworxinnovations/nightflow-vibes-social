export class StreamingConfig {
  // Update to use your actual DigitalOcean Droplet IP
  private static readonly DROPLET_IP = 'YOUR_DROPLET_IP_HERE'; // You'll need to replace this with your actual droplet IP
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
  
  // UPDATED: Use your DigitalOcean Droplet for RTMP
  static getOBSServerUrl(): string {
    return this.isProduction()
      ? `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`
      : 'rtmp://localhost:1935/live';
  }

  static getOBSServerUrlBackup(): string {
    return this.getOBSServerUrl();
  }
  
  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }
  
  static getHlsUrl(streamKey: string): string {
    const baseUrl = this.isProduction() 
      ? `http://${this.DROPLET_IP}:8080`
      : 'http://localhost:3001';
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

  // Updated connection test for Droplet
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const serverUrl = this.getOBSServerUrl();
    
    const testServer = async () => {
      try {
        console.log('🔍 Testing DigitalOcean Droplet RTMP server...');
        
        // Test the Droplet server health
        const healthUrl = this.isProduction() 
          ? `http://${this.DROPLET_IP}:3001/health`
          : 'http://localhost:3001/health';
        
        console.log('📡 Testing Droplet health endpoint:', healthUrl);
        
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
        
        console.log('📊 Droplet health response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ DigitalOcean Droplet responded successfully:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ Droplet returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `Server returned ${response.status}: ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ Droplet connectivity test failed:', error);
        
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
      recommendations.push('✅ DigitalOcean Droplet is online and responding!');
      recommendations.push('✅ RTMP server should be accessible on port 1935');
      recommendations.push(`✅ Try OBS connection: ${serverUrl}`);
      recommendations.push('✅ Your stream key should work now');
    } else {
      recommendations.push('❌ DigitalOcean Droplet health check failed');
      recommendations.push('⚠️ Check if your Droplet is running');
      recommendations.push('💡 Verify firewall allows port 1935');
      recommendations.push('🔧 Ensure RTMP server is started on the Droplet');
      recommendations.push('📞 Check Droplet status in DigitalOcean dashboard');
    }

    return {
      primary: result,
      backup: result,
      recommendations
    };
  }

  static getTroubleshootingSteps(): string[] {
    return [
      `✅ Use exact server URL: ${this.getOBSServerUrl()}`,
      '✅ Ensure Droplet firewall allows port 1935',
      '✅ Restart OBS completely after configuration',
      '✅ Test from different network (mobile hotspot)',
      '✅ Check Droplet is running in DigitalOcean dashboard',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service',
      '⚠️ If fails: SSH into Droplet and check RTMP server status'
    ];
  }
}
