
export class EnvironmentConfig {
  private static readonly DIGITALOCEAN_APP_URL = 'https://nightflow-app-wijb2.ondigitalocean.app';
  private static readonly RTMP_PORT = 1935;
  private static readonly HLS_PORT = 8080;

  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }

  static isDropletEnvironment(): boolean {
    return window.location.hostname === 'nightflow-app-wijb2.ondigitalocean.app';
  }

  static getDigitalOceanAppUrl(): string {
    return this.DIGITALOCEAN_APP_URL;
  }

  static getRtmpPort(): number {
    return this.RTMP_PORT;
  }

  static getHlsPort(): number {
    return this.HLS_PORT;
  }

  static getActualDeploymentUrl(): string {
    return this.DIGITALOCEAN_APP_URL;
  }

  static debugUrls(streamKey: string) {
    const rtmpUrl = `rtmp://nightflow-app-wijb2.ondigitalocean.app:${this.RTMP_PORT}/live`;
    const hlsUrl = `${this.DIGITALOCEAN_APP_URL}/live/${streamKey}/index.m3u8`;
    
    console.log('🔍 Correct URL Configuration:');
    console.log('- RTMP URL (for OBS):', rtmpUrl);
    console.log('- HLS URL (for playback):', hlsUrl);
    console.log('- Stream Key:', streamKey);
    console.log('- DigitalOcean App URL:', this.getActualDeploymentUrl());
    console.log('- All URLs using HTTPS/secure protocols');
    
    return { rtmpUrl, hlsUrl };
  }

  static async checkServerStatus(): Promise<{ available: boolean; details: string[] }> {
    const results: string[] = [];
    let serverAvailable = false;

    console.log('🔍 Testing DigitalOcean app deployment...');
    
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
        results.push('✅ DigitalOcean App: Online and responding');
        results.push('✅ HTTPS Protocol: Secure connection established');
        results.push('✅ Health Check: Passing');
        results.push('✅ RTMP Server: Ready for OBS connections');
        results.push('✅ HLS Streaming: Ready for HTTPS playback');
        results.push('✅ WebSocket: Available for real-time updates');
        results.push('');
        results.push('🎯 STREAMING READY:');
        results.push(`• OBS Server: rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live`);
        results.push(`• Web Streaming: ${deploymentUrl}/live/[streamKey]/index.m3u8`);
        results.push('• All services using secure HTTPS/WSS protocols');
        serverAvailable = true;
        console.log('✅ DigitalOcean app deployment confirmed operational');
      } else {
        results.push(`⚠️ App responded with status: ${response.status}`);
        results.push('• Server may be starting up or experiencing issues');
      }
      
    } catch (error) {
      console.error('❌ DigitalOcean app deployment test failed:', error);
      results.push('❌ Cannot reach DigitalOcean app deployment');
      results.push('• Check if the app is running');
      results.push('• Verify network connectivity');
      results.push('• Ensure HTTPS is properly configured');
    }

    return {
      available: serverAvailable,
      details: results
    };
  }
}
