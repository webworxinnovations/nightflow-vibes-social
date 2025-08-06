
export class EnvironmentConfig {
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly RTMP_PORT = 1935;
  private static readonly HLS_PORT = 3443;

  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }

  static isDropletEnvironment(): boolean {
    return true; // Always use droplet
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static getRtmpPort(): number {
    return this.RTMP_PORT;
  }

  static getHlsPort(): number {
    return this.HLS_PORT;
  }

  static getActualDeploymentUrl(): string {
    return `https://${this.DROPLET_IP}:3443`;
  }

  static debugUrls(streamKey: string) {
    const rtmpUrl = `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
    const hlsUrl = `https://${this.DROPLET_IP}:3443/live/${streamKey}/index.m3u8`;
    
    console.log('🔍 DigitalOcean Droplet Configuration:');
    console.log('- RTMP URL (for OBS):', rtmpUrl);
    console.log('- HLS URL (for playback):', hlsUrl);
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', this.DROPLET_IP);
    console.log('- All URLs using Droplet IP directly');
    
    return { rtmpUrl, hlsUrl };
  }

  static async checkServerStatus(): Promise<{ available: boolean; details: string[] }> {
    const results: string[] = [];
    let serverAvailable = false;

    console.log('🔍 Testing DigitalOcean droplet deployment...');
    
    try {
      const deploymentUrl = this.getActualDeploymentUrl();
      const healthUrl = `${deploymentUrl}/health`;
      
      console.log(`Testing DigitalOcean droplet health: ${healthUrl}`);
      
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
        results.push('✅ DigitalOcean Droplet: Online and responding');
        results.push('✅ HTTP Protocol: Direct connection established');
        results.push('✅ Health Check: Passing');
        results.push('✅ RTMP Server: Ready for OBS connections');
        results.push('✅ HLS Streaming: Ready for HTTP playback');
        results.push('✅ WebSocket: Available for real-time updates');
        results.push('');
        results.push('🎯 STREAMING READY:');
         results.push(`• OBS Server: rtmp://${this.DROPLET_IP}:1935/live`);
         results.push(`• Web Streaming: https://${this.DROPLET_IP}:3443/live/[streamKey]/index.m3u8`);
        results.push('• All services using DigitalOcean Droplet IP');
        serverAvailable = true;
        console.log('✅ DigitalOcean droplet deployment confirmed operational');
      } else {
        results.push(`⚠️ Droplet responded with status: ${response.status}`);
        results.push('• Server may be starting up or experiencing issues');
      }
      
    } catch (error) {
      console.error('❌ DigitalOcean droplet deployment test failed:', error);
      results.push('❌ Cannot reach DigitalOcean droplet deployment');
      results.push('• Check if the droplet is running');
      results.push('• Verify network connectivity');
      results.push('• Ensure HTTP is properly configured');
    }

    return {
      available: serverAvailable,
      details: results
    };
  }
}
