
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
    const dropletIP = EnvironmentConfig.getDropletIP();
    const hlsPort = EnvironmentConfig.getHlsPort();
    
    // Log all possible URLs for debugging
    console.log('🔍 HLS URL Generation Debug:');
    console.log('- Stream Key:', streamKey);
    console.log('- Droplet IP:', dropletIP);
    console.log('- HLS Port from config:', hlsPort);
    
    // Try the primary HLS URL first
    const hlsUrl = `http://${dropletIP}:${hlsPort}/live/${streamKey}/index.m3u8`;
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
      `http://${dropletIP}:3001/hls/${streamKey}/index.m3u8`,
      `http://${dropletIP}:1935/hls/${streamKey}/index.m3u8`
    ];
  }

  // Add method to test server connectivity
  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    const dropletIP = EnvironmentConfig.getDropletIP();
    const testUrls = [
      `http://${dropletIP}:8888`,
      `http://${dropletIP}:8080`,
      `http://${dropletIP}:3001`,
      `http://${dropletIP}:1935`
    ];

    const results = [];
    
    for (const url of testUrls) {
      try {
        console.log(`🔍 Testing connectivity to: ${url}`);
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        results.push(`${url}: Available`);
        console.log(`✅ ${url}: Available`);
      } catch (error) {
        results.push(`${url}: Not available - ${error}`);
        console.log(`❌ ${url}: Not available -`, error);
      }
    }

    return {
      available: results.some(r => r.includes('Available')),
      testedUrls: results
    };
  }
}
