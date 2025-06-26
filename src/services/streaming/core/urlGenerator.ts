
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getRailwayDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    return EnvironmentConfig.isProduction()
      ? `rtmp://${EnvironmentConfig.getDropletIP()}:${EnvironmentConfig.getRtmpPort()}/live`
      : 'rtmp://localhost:1935/live';
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    const baseUrl = EnvironmentConfig.isProduction() 
      ? `http://${EnvironmentConfig.getDropletIP()}:8080`
      : 'http://localhost:3001';
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    const protocol = EnvironmentConfig.isProduction() ? 'wss' : 'ws';
    const domain = EnvironmentConfig.isProduction() ? EnvironmentConfig.getRailwayDomain() : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
