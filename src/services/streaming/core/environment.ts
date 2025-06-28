
export class EnvironmentConfig {
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly DIGITALOCEAN_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
  private static readonly RTMP_PORT = 1935;
  private static readonly HLS_PORT = 8080;

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
    // Use droplet IP for streaming since that's what works
    return this.DROPLET_IP;
  }
}
