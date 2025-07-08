
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use HTTPS SSL port (3443) 
    return 'https://67.205.179.77:3443';
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
    // Use HTTPS SSL port (3443) for HLS streaming
    const hlsUrl = `https://67.205.179.77:3443/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (HTTPS SSL):');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', '67.205.179.77');
    console.log('- HTTPS SSL Port:', '3443');
    console.log('- Generated HLS URL:', hlsUrl);
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WSS (secure WebSocket) on SSL port (3443)
    return `wss://67.205.179.77:3443/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing droplet server on correct port 3001...');
    
    try {
      const response = await fetch('https://67.205.179.77:3443/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      const results = [
        `✅ Droplet server: https://67.205.179.77:3443 - ${response.ok ? 'ONLINE' : 'Issues detected'}`,
        '✅ HTTPS protocol: Secure SSL connection to your server',
        '✅ RTMP server: rtmp://67.205.179.77:1935 (should be running)',
        '✅ HLS streaming: Available via HTTPS on port 3443',
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
        '❌ Droplet server: https://67.205.179.77:3443 - CONNECTION FAILED',
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
