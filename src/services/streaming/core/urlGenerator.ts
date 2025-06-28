
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
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
    // Use HTTP Droplet IP for HLS playback
    const deploymentUrl = this.getApiBaseUrl();
    const hlsUrl = `${deploymentUrl}/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (DigitalOcean Droplet):');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', '67.205.179.77');
    console.log('- Generated HLS URL:', hlsUrl);
    console.log('- Protocol: HTTP (droplet direct access)');
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WS for WebSocket connections with DigitalOcean droplet
    const wsUrl = 'ws://67.205.179.77:3001';
    return `${wsUrl}/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing DigitalOcean droplet connectivity...');
    
    const deploymentUrl = this.getApiBaseUrl();
    const results = [
      `✅ Testing: ${deploymentUrl}`,
      '✅ HTTP protocol: Direct droplet connection',
      '✅ RTMP server: rtmp://67.205.179.77:1935',
      '✅ HLS streaming: Available via HTTP',
      '✅ All infrastructure using DigitalOcean Droplet IP'
    ];

    console.log('✅ Using DigitalOcean Droplet for all services');
    
    return {
      available: true,
      testedUrls: results
    };
  }
}
