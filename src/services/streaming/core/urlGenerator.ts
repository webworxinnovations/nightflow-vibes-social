
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use droplet IP for API calls since that's where our server is running
    return EnvironmentConfig.isProduction() 
      ? `http://${EnvironmentConfig.getDropletIP()}:3001`
      : 'http://localhost:3001';
  }

  static getOBSServerUrl(): string {
    // Use droplet IP for RTMP - this is what works with OBS
    return `rtmp://${EnvironmentConfig.getDropletIP()}:${EnvironmentConfig.getRtmpPort()}/live`;
  }

  static getRtmpUrl(): string {
    return this.getOBSServerUrl();
  }

  static getHlsUrl(streamKey: string): string {
    // FIXED: Use consistent port 8080 for HLS video playback
    const baseUrl = `http://${EnvironmentConfig.getDropletIP()}:8080`;
    return `${baseUrl}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use droplet IP for WebSocket connections
    const protocol = EnvironmentConfig.isProduction() ? 'ws' : 'ws';
    const host = `${EnvironmentConfig.getDropletIP()}:3001`;
    return `${protocol}://${host}/ws/stream/${streamKey}`;
  }
}
