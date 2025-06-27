
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    if (EnvironmentConfig.isDropletEnvironment()) {
      return `https://${EnvironmentConfig.getDropletDomain()}`;
    }
    
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getRailwayDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // Always use droplet domain for RTMP - this is where your server is running
    return `rtmp://${EnvironmentConfig.getDropletDomain()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    const baseUrl = EnvironmentConfig.isProduction() 
      ? `http://${EnvironmentConfig.getDropletDomain()}:8888`
      : 'http://localhost:3001';
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    const protocol = EnvironmentConfig.isProduction() ? 'wss' : 'ws';
    const domain = EnvironmentConfig.isDropletEnvironment() 
      ? EnvironmentConfig.getDropletDomain() 
      : EnvironmentConfig.isProduction() 
        ? EnvironmentConfig.getRailwayDomain() 
        : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
