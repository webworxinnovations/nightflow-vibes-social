
export class EnvironmentConfig {
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly DIGITALOCEAN_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
  private static readonly RTMP_PORT = 1935;
  private static readonly HLS_PORT = 8888; // FIXED: Updated to match actual server port

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

  // Debug method to verify URLs
  static debugUrls(streamKey: string) {
    const rtmpUrl = `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
    const hlsUrl = `http://${this.DROPLET_IP}:${this.HLS_PORT}/live/${streamKey}/index.m3u8`;
    
    console.log('🔍 URL Configuration Debug:');
    console.log('- RTMP URL (for OBS):', rtmpUrl);
    console.log('- HLS URL (for playback):', hlsUrl);
    console.log('- Stream Key:', streamKey);
    
    return { rtmpUrl, hlsUrl };
  }
}
