
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use DigitalOcean App Platform deployment
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getDropletDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // Use DigitalOcean domain for RTMP - your actual deployed server
    return `rtmp://${EnvironmentConfig.getDropletDomain()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    const baseUrl = EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getDropletDomain()}`
      : 'http://localhost:3001';
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    const protocol = EnvironmentConfig.isProduction() ? 'wss' : 'ws';
    const domain = EnvironmentConfig.isProduction() 
        ? EnvironmentConfig.getDropletDomain() 
        : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
