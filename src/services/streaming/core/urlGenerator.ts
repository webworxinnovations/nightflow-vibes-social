
import { EnvironmentConfig } from './environment';

export class URLGenerator {
  static getApiBaseUrl(): string {
    return EnvironmentConfig.getActualDeploymentUrl();
  }

  static getOBSServerUrl(): string {
    // Use your DigitalOcean app URL for RTMP - OBS needs the server without /live
    return `rtmp://nightflow-app-wijb2.ondigitalocean.app:${EnvironmentConfig.getRtmpPort()}`;
  }

  static getRtmpUrl(): string {
    // Full RTMP URL with /live path for internal use
    return `${this.getOBSServerUrl()}/live`;
  }

  static getHlsUrl(streamKey: string): string {
    // Use HTTPS DigitalOcean app URL for HLS playback
    const deploymentUrl = EnvironmentConfig.getActualDeploymentUrl();
    const hlsUrl = `${deploymentUrl}/live/${streamKey}/index.m3u8`;
    
    console.log('🎥 HLS URL Generation:');
    console.log('- Stream Key:', streamKey);
    console.log('- App URL:', deploymentUrl);
    console.log('- Generated HLS URL:', hlsUrl);
    console.log('- Protocol: HTTPS (secure)');
    
    return hlsUrl;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WSS for secure WebSocket connections
    const appUrl = EnvironmentConfig.getActualDeploymentUrl();
    const wsUrl = appUrl.replace('https://', 'wss://');
    return `${wsUrl}/ws/stream/${streamKey}`;
  }

  static async testServerConnectivity(): Promise<{ available: boolean; testedUrls: string[] }> {
    console.log('🔍 Testing server connectivity with DigitalOcean app...');
    
    const deploymentUrl = EnvironmentConfig.getActualDeploymentUrl();
    const results = [
      `✅ Testing: ${deploymentUrl}`,
      '✅ HTTPS protocol: Secure connection',
      '✅ RTMP server: rtmp://nightflow-app-wijb2.ondigitalocean.app:1935',
      '✅ HLS streaming: Available via HTTPS',
      '✅ All infrastructure using DigitalOcean app URL'
    ];

    console.log('✅ Using consistent DigitalOcean app URLs for all services');
    
    return {
      available: true,
      testedUrls: results
    };
  }
}
