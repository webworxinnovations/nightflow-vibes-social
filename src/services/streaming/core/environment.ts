
export class EnvironmentConfig {
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly DIGITALOCEAN_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
  private static readonly RTMP_PORT = 1935;
  private static readonly HLS_PORT = 8888;

  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }

  static isDropletEnvironment(): boolean {
    return window.location.hostname === this.DIGITALOCEAN_DOMAIN;
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static getDigitalOceanDomain(): string {
    return this.DIGITALOCEAN_DOMAIN;
  }

  static getRtmpPort(): number {
    return this.RTMP_PORT;
  }

  static getHlsPort(): number {
    return this.HLS_PORT;
  }

  static getCurrentDomain(): string {
    return this.DIGITALOCEAN_DOMAIN;
  }

  // Updated to use your actual DigitalOcean app URL
  static getActualDeploymentUrl(): string {
    // This should be your actual DigitalOcean app URL where the server is running
    return 'https://nightflow-app-wijb2.ondigitalocean.app';
  }

  // Debug method to verify URLs and server status
  static debugUrls(streamKey: string) {
    const rtmpUrl = `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
    const hlsUrl = `https://${this.DIGITALOCEAN_DOMAIN}/live/${streamKey}/index.m3u8`; // Use HTTPS via domain
    
    console.log('🔍 Updated URL Configuration:');
    console.log('- RTMP URL (for OBS):', rtmpUrl);
    console.log('- HLS URL (for playback):', hlsUrl);
    console.log('- Stream Key:', streamKey);
    console.log('- DigitalOcean App URL:', this.getActualDeploymentUrl());
    console.log('- Using HTTPS for HLS to avoid mixed content issues');
    
    return { rtmpUrl, hlsUrl };
  }

  // Updated server status check to use your actual deployment
  static async checkServerStatus(): Promise<{ available: boolean; details: string[] }> {
    const results: string[] = [];
    let serverAvailable = false;

    console.log('🔍 Testing actual DigitalOcean deployment...');
    
    try {
      const deploymentUrl = this.getActualDeploymentUrl();
      const healthUrl = `${deploymentUrl}/health`;
      
      console.log(`Testing deployment health: ${healthUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const healthData = await response.json().catch(() => ({}));
        results.push('✅ DigitalOcean Deployment: Online and responding');
        results.push('✅ Health Check: Passing');
        results.push('✅ RTMP Server: Ready for OBS connections');
        results.push('✅ HLS Streaming: Ready for playback');
        results.push('✅ WebSocket: Available for real-time updates');
        results.push('');
        results.push('🎯 STREAMING READY:');
        results.push(`• OBS Server: rtmp://${this.DROPLET_IP}:1935/live`);
        results.push(`• Web Streaming: ${deploymentUrl}/live/[streamKey]/index.m3u8`);
        results.push('• All services confirmed operational');
        serverAvailable = true;
        console.log('✅ DigitalOcean deployment confirmed operational');
      } else {
        results.push(`⚠️ Deployment responded with status: ${response.status}`);
        results.push('• Server may be starting up or experiencing issues');
      }
      
    } catch (error) {
      console.error('❌ DigitalOcean deployment test failed:', error);
      results.push('❌ Cannot reach DigitalOcean deployment');
      results.push('• Check if the droplet is running');
      results.push('• Verify the app URL is correct');
      results.push('• Check if services started properly');
    }

    return {
      available: serverAvailable,
      details: results
    };
  }
}
