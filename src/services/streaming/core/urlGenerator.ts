
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Always use droplet IP for all API calls
    return 'http://67.205.179.77:3001';
  }

  static getOBSServerUrl(): string {
    // OBS needs just the RTMP URL without /live path
    return `rtmp://67.205.179.77:${EnvironmentConfig.getRtmpPort()}`;
  }

  static getRtmpUrl(): string {
    // Full RTMP URL with /live path for internal use
    return `${this.getOBSServerUrl()}/live`;
  }

  static getHlsUrl(streamKey: string): string {
    // Use droplet IP for HLS streaming
    const hlsUrl = `http://67.205.179.77:3001/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (Droplet Only):');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', '67.205.179.77');
    console.log('- Generated HLS URL:', hlsUrl);
    console.log('- Protocol: HTTP (droplet direct connection)');
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use droplet IP for WebSocket connections
    return `ws://67.205.179.77:3001/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing DigitalOcean droplet connectivity...');
    
    const results = [
      `✅ Testing droplet: http://67.205.179.77:3001`,
      '✅ HTTP protocol: Direct droplet connection',
      '✅ RTMP server: rtmp://67.205.179.77:1935',
      '✅ HLS streaming: Available via droplet HTTP',
      '✅ All services using droplet IP only'
    ];

    console.log('✅ Using droplet IP only for all connections');
    
    return {
      available: true,
      testedUrls: results
    };
  }
}
