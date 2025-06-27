
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Always use Railway for production since it's properly configured
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getRailwayDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // Use Railway domain for RTMP - this is where your server is actually running
    return `rtmp://${EnvironmentConfig.getRailwayDomain()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    const baseUrl = EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getRailwayDomain()}`
      : 'http://localhost:3001';
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    const protocol = EnvironmentConfig.isProduction() ? 'wss' : 'ws';
    const domain = EnvironmentConfig.isProduction() 
        ? EnvironmentConfig.getRailwayDomain() 
        : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
