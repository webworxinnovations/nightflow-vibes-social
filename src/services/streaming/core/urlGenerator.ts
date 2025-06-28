
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use Railway for API calls (frontend hosting)
    return EnvironmentConfig.isProduction() 
      ? `https://${EnvironmentConfig.getRailwayDomain()}`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // ALWAYS use droplet IP for RTMP - this is where OBS connects
    return `rtmp://${EnvironmentConfig.getDropletIP()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    // Use droplet IP for HLS video playback - this is the key fix
    const baseUrl = `http://${EnvironmentConfig.getDropletIP()}:8080`;
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use droplet IP for WebSocket connections
    const protocol = EnvironmentConfig.isProduction() ? 'ws' : 'ws';
    const domain = EnvironmentConfig.isProduction() 
        ? `${EnvironmentConfig.getDropletIP()}:3001`
        : 'localhost:3001';
    return `${protocol}://${domain}/ws/stream/${streamKey}`;
  }
}
