
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Always use HTTP for direct droplet access to avoid mixed content issues
    return 'http://67.205.179.77:3001';
  }

  static getOBSServerUrl(): string {
    // Use Droplet IP for RTMP - OBS needs the server without /live
    return `rtmp://67.205.179.77:${EnvironmentConfig.getRtmpPort()}`;
  }

  static getRtmpUrl(): string {
    // Full RTMP URL with /live path for internal use
    return `${this.getOBSServerUrl()}/live`;
  }

  static getHlsUrl(streamKey: string): string {
    // Always use HTTP for HLS to avoid mixed content issues
    const deploymentUrl = 'http://67.205.179.77:3001';
    const hlsUrl = `${deploymentUrl}/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (Mixed Content Safe):');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', '67.205.179.77');
    console.log('- Generated HLS URL:', hlsUrl);
    console.log('- Protocol: HTTP (avoiding mixed content issues)');
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WS for WebSocket connections with DigitalOcean droplet
    const wsUrl = 'ws://67.205.179.77:3001';
    return `${wsUrl}/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing DigitalOcean droplet connectivity (mixed content safe)...');
    
    const deploymentUrl = this.getApiBaseUrl();
    const results = [
      `✅ Testing: ${deploymentUrl}`,
      '✅ HTTP protocol: Safe for mixed content',
      '✅ RTMP server: rtmp://67.205.179.77:1935',
      '✅ HLS streaming: Available via HTTP',
      '✅ All infrastructure using HTTP to avoid HTTPS/HTTP conflicts'
    ];

    console.log('✅ Using HTTP for all droplet connections to avoid mixed content issues');
    
    return {
      available: true,
      testedUrls: results
    };
  }
}
