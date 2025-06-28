
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use DigitalOcean domain for API calls
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getDigitalOceanDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // Use DigitalOcean domain for RTMP - your server logs show this is working
    return `rtmp://${EnvironmentConfig.getDigitalOceanDomain()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    // Use DigitalOcean domain for HLS video playback
    const baseUrl = `https://${EnvironmentConfig.getDigitalOceanDomain()}`;
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use DigitalOcean domain for WebSocket connections
    const protocol = EnvironmentConfig.isProduction() ? 'wss' : 'ws';
    const domain = EnvironmentConfig.getDigitalOceanDomain();
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
