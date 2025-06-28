
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

  // Debug method to verify URLs and server status
  static debugUrls(streamKey: string) {
    const rtmpUrl = `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
    const hlsUrl = `http://${this.DROPLET_IP}:${this.HLS_PORT}/live/${streamKey}/index.m3u8`;
    
    console.log('🔍 URL Configuration Debug:');
    console.log('- RTMP URL (for OBS):', rtmpUrl);
    console.log('- HLS URL (for playback):', hlsUrl);
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', this.DROPLET_IP);
    console.log('- Expected HLS Port:', this.HLS_PORT);
    console.log('- Expected RTMP Port:', this.RTMP_PORT);
    
    return { rtmpUrl, hlsUrl };
  }

  // Check server status method
  static async checkServerStatus(): Promise<{ available: boolean; details: string[] }> {
    const testPorts = [this.HLS_PORT, 8080, 3001, this.RTMP_PORT];
    const results: string[] = [];
    let anyAvailable = false;

    console.log('🔍 Testing DigitalOcean server connectivity...');
    
    for (const port of testPorts) {
      try {
        const testUrl = `http://${this.DROPLET_IP}:${port}`;
        console.log(`Testing: ${testUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(testUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        results.push(`✅ Port ${port}: Responding`);
        anyAvailable = true;
        console.log(`✅ Port ${port} is responding`);
        
      } catch (error) {
        results.push(`❌ Port ${port}: Not available`);
        console.log(`❌ Port ${port} failed:`, error);
      }
    }

    if (!anyAvailable) {
      results.push('');
      results.push('🚨 ISSUE DETECTED:');
      results.push('- DigitalOcean droplet may be stopped');
      results.push('- Streaming services may have crashed');
      results.push('- Firewall may be blocking ports');
      results.push('');
      results.push('💡 NEXT STEPS:');
      results.push('1. Check DigitalOcean droplet status');
      results.push('2. Restart streaming services if needed');
      results.push('3. Verify firewall allows ports 1935, 8080, 8888');
    }

    return {
      available: anyAvailable,
      details: results
    };
  }
}
