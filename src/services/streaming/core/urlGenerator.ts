
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use DigitalOcean domain for API calls
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getDigitalOceanDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // CRITICAL: Use direct IP for RTMP - DigitalOcean App Platform doesn't expose TCP ports on domains
    return `rtmp://${EnvironmentConfig.getDropletIP()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    // Use DigitalOcean domain for HLS video playback via HTTP
    const baseUrl = `https://${EnvironmentConfig.getDigitalOceanDomain()}`;
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use DigitalOcean domain for WebSocket connections
    const protocol = EnvironmentConfig.isProduction() ? 'wss' : 'ws';
    const domain = EnvironmentConfig.isProduction() 
        ? EnvironmentConfig.getDigitalOceanDomain()
        : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
