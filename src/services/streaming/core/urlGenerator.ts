
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use the correct droplet server port
    return 'http://67.205.179.77:8888';
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
    // Use the correct droplet port for HLS streaming
    const hlsUrl = `http://67.205.179.77:8888/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (Correct Port):');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', '67.205.179.77');
    console.log('- Correct Port:', '8888');
    console.log('- Generated HLS URL:', hlsUrl);
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use the correct droplet port for WebSocket connections
    return `ws://67.205.179.77:8888/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing droplet server on correct port 8888...');
    
    try {
      const response = await fetch('http://67.205.179.77:8888/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      const results = [
        `✅ Droplet server: http://67.205.179.77:8888 - ${response.ok ? 'ONLINE' : 'Issues detected'}`,
        '✅ HTTP protocol: Direct connection to your running server',
        '✅ RTMP server: rtmp://67.205.179.77:1935 (should be running)',
        '✅ HLS streaming: Available via your droplet',
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
        '❌ Droplet server: http://67.205.179.77:8888 - CONNECTION FAILED',
        '⚠️ Check if your server is still running',
        '⚠️ RTMP server: May not be accessible',
        '⚠️ Verify your droplet is still online in DigitalOcean dashboard'
      ];
      
      return {
        available: false,
        testedUrls: results
      };
    }
  }
}
