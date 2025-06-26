
export class EnvironmentConfig {
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly DROPLET_DOMAIN = 'nightflow-app-wijb2.ondigitalocean.app';
  private static readonly RAILWAY_DOMAIN = 'nightflow-vibes-social-production.up.railway.app';
  private static readonly RTMP_PORT = 1935;

  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }

  static isDropletEnvironment(): boolean {
    return window.location.hostname === this.DROPLET_DOMAIN || 
           window.location.hostname === this.DROPLET_IP;
  }

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static getDropletDomain(): string {
    return this.DROPLET_DOMAIN;
  }

  static getRailwayDomain(): string {
    return this.RAILWAY_DOMAIN;
  }

  static getRtmpPort(): number {
    return this.RTMP_PORT;
  }

  static getCurrentDomain(): string {
    if (this.isDropletEnvironment()) {
      return this.DROPLET_DOMAIN;
    }
    return this.RAILWAY_DOMAIN;
  }
}
