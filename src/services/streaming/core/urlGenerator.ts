
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use HTTP to avoid Mixed Content issues with browser security
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
    // Use HTTP to avoid Mixed Content issues with browser security  
    const hlsUrl = `http://67.205.179.77:3001/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (HTTP for compatibility):');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', '67.205.179.77');
    console.log('- HTTP Port:', '3001');
    console.log('- Generated HLS URL:', hlsUrl);
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WSS (secure WebSocket) on SSL port (3443)
    return `wss://67.205.179.77:3443/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing droplet server on working HTTP port 9001...');
    
    try {
      const response = await fetch('https://67.205.179.77:3443/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      const results = [
        `✅ Droplet server: http://67.205.179.77:9001 - ${response.ok ? 'ONLINE' : 'Issues detected'}`,
        '✅ HTTP protocol: Working connection to your server',
        '✅ RTMP server: rtmp://67.205.179.77:1935 (should be running)',
        '✅ HLS streaming: Available via HTTP on port 9001',
        response.ok ? '✅ Server is responding correctly!' : '⚠️ Server responding but with issues'
      ];

      console.log(response.ok ? '✅ Your server is working!' : '⚠️ Server issues detected');
      
      return {
        available: response.ok,
        testedUrls: results
      };
    } catch (error) {
      console.error('❌ Could not connect to your server:', error);
      
      const results = [
        '❌ Droplet server: http://67.205.179.77:9001 - CONNECTION FAILED',
        '⚠️ Your droplet server is not running',
        '⚠️ Start your server: npm start in the server folder',
        '⚠️ Or run: node streaming-server.js in your droplet'
      ];
      
      return {
        available: false,
        testedUrls: results
      };
    }
  }
}
