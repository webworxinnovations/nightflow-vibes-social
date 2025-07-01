
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    // Use your actual running droplet server
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
    // Use your actual running droplet for HLS streaming
    const hlsUrl = `http://67.205.179.77:3001/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation (Your Running Server):');
    console.log('- Stream Key:', streamKey);
    console.log('- Your Droplet IP:', '67.205.179.77');
    console.log('- Generated HLS URL:', hlsUrl);
    console.log('- Protocol: HTTP (direct connection to your running server)');
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use your actual running droplet for WebSocket connections
    return `ws://67.205.179.77:3001/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing your actual running droplet server...');
    
    try {
      const response = await fetch('http://67.205.179.77:3001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      const results = [
        `✅ Your server: http://67.205.179.77:3001 - ${response.ok ? 'ONLINE' : 'Issues detected'}`,
        '✅ HTTP protocol: Direct connection to your running server',
        '✅ RTMP server: rtmp://67.205.179.77:1935 (running in PowerShell)',
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
        '❌ Your server: http://67.205.179.77:3001 - CONNECTION FAILED',
        '⚠️ Check if your PowerShell server is still running',
        '⚠️ RTMP server: May not be accessible',
        '⚠️ Make sure you keep PowerShell window open'
      ];
      
      return {
        available: false,
        testedUrls: results
      };
    }
  }
}
