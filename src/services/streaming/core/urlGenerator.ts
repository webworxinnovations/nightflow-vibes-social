
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
    // Try different port combinations based on what we've seen in the network requests
    const dropletIP = EnvironmentConfig.getDropletIP();
    
    // Log all possible URLs for debugging
    console.log('🔍 HLS URL Generation Debug:');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', dropletIP);
    console.log('- Attempting HLS on port 8888');
    
    const hlsUrl = `http://${dropletIP}:8888/live/${streamKey}/index.m3u8`;
    console.log('- Generated HLS URL:', hlsUrl);
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use droplet IP for WebSocket connections
    const protocol = EnvironmentConfig.isProduction() ? 'ws' : 'ws';
    const host = `${EnvironmentConfig.getDropletIP()}:3001`;
    return `${protocol}://${host}/ws/stream/${streamKey}`;
  }

  // Add method to test multiple HLS URLs if needed
  static getAlternativeHlsUrls(streamKey: string): string[] {
    const dropletIP = EnvironmentConfig.getDropletIP();
    return [
      `http://${dropletIP}:8888/live/${streamKey}/index.m3u8`,
      `http://${dropletIP}:8080/live/${streamKey}/index.m3u8`,
      `http://${dropletIP}:3001/hls/${streamKey}/index.m3u8`
    ];
  }
}
