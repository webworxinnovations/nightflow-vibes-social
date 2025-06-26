
export class StreamingConfig {
  // Use a known working RTMP server configuration
  private static readonly RTMP_HOST = 'rtmp.nightflow.app';
  private static readonly RTMP_PORT = 1935;
  private static readonly BACKUP_HOST = 'live.nightflow.stream';
  
  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }
  
  static getApiBaseUrl(): string {
    return this.isProduction() 
      ? 'https://nightflow-vibes-social-production.up.railway.app'
      : 'http://localhost:3001';
  }
  
  // PRIMARY RTMP URL - This is what OBS needs
  static getOBSServerUrl(): string {
    return this.isProduction()
      ? `rtmp://${this.RTMP_HOST}:${this.RTMP_PORT}/live`
      : 'rtmp://localhost:1935/live';
  }

  // BACKUP RTMP URL if primary fails
  static getOBSServerUrlBackup(): string {
    return this.isProduction()
      ? `rtmp://${this.BACKUP_HOST}:${this.RTMP_PORT}/live`
      : 'rtmp://127.0.0.1:1935/live';
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
    const domain = this.isProduction() ? 'nightflow-vibes-social-production.up.railway.app' : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `nf_${userId.substring(0, 8)}_${timestamp}_${random}`;
  }

  static getOBSSetupInstructions(): {
    service: string;
    server: string;
    backup_server: string;
    steps: string[];
  } {
    return {
      service: 'Custom...',
      server: this.getOBSServerUrl(),
      backup_server: this.getOBSServerUrlBackup(),
      steps: [
        '1. Open OBS Studio',
        '2. Go to Settings → Stream',
        '3. Service: Select "Custom..."',
        `4. Server: ${this.getOBSServerUrl()}`,
        '5. Stream Key: Copy from app',
        '6. Click Apply → OK',
        '7. Click Start Streaming'
      ]
    };
  }

  // Test RTMP connectivity
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const primaryUrl = this.getOBSServerUrl();
    const backupUrl = this.getOBSServerUrlBackup();
    
    const testUrl = async (url: string) => {
      try {
        // Extract host from RTMP URL for HTTP health check
        const match = url.match(/rtmp:\/\/([^:]+):/);
        if (!match) throw new Error('Invalid RTMP URL format');
        
        const host = match[1];
        const healthUrl = `https://${host}/health`;
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          timeout: 5000
        });
        
        return { success: response.ok, url, error: undefined };
      } catch (error) {
        return { 
          success: false, 
          url, 
          error: error instanceof Error ? error.message : 'Connection failed'
        };
      }
    };

    const [primaryResult, backupResult] = await Promise.all([
      testUrl(primaryUrl),
      testUrl(backupUrl)
    ]);

    const recommendations = [];
    
    if (!primaryResult.success && !backupResult.success) {
      recommendations.push('Both RTMP servers unavailable - check internet connection');
      recommendations.push('Try mobile hotspot to test if ISP blocks RTMP');
      recommendations.push('Contact support for alternative streaming method');
    } else if (!primaryResult.success) {
      recommendations.push(`Use backup server: ${backupUrl}`);
      recommendations.push('Primary RTMP server experiencing issues');
    } else {
      recommendations.push('RTMP connection ready - start streaming in OBS');
    }

    return {
      primary: primaryResult,
      backup: backupResult,
      recommendations
    };
  }

  static getTroubleshootingSteps(): string[] {
    return [
      '✅ Use exact server URL in OBS Custom service',
      '✅ Ensure firewall allows port 1935 outbound',
      '✅ Try backup server if primary fails',
      '✅ Test from different network (mobile hotspot)',
      '✅ Restart OBS completely after configuration',
      '✅ Check ISP doesn\'t block RTMP streaming',
      '✅ Use generated stream key exactly as provided'
    ];
  }
}
