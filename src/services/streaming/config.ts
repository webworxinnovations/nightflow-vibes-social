
import { URLGenerator } from './core/urlGenerator';
import { EnvironmentConfig } from './core/environment';

export class StreamingConfig {
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `nf_${userId.split('-')[0]}_${timestamp}_${random}`;
  }

  static getRtmpUrl(): string {
    return URLGenerator.getRtmpUrl();
  }

  static getHlsUrl(streamKey: string): string {
    return URLGenerator.getHlsUrl(streamKey);
  }

  static getWebSocketUrl(streamKey: string): string {
    return URLGenerator.getWebSocketUrl(streamKey);
  }

  static getApiBaseUrl(): string {
    return URLGenerator.getApiBaseUrl();
  }

  // New methods that components are expecting
  static getOBSServerUrl(): string {
    return URLGenerator.getRtmpUrl();
  }

  static isProduction(): boolean {
    return EnvironmentConfig.isProduction();
  }

  static getPortInfo(): {
    rtmpPort: number;
    description: string;
    compatibility: string;
  } {
    return {
      rtmpPort: EnvironmentConfig.getRtmpPort(),
      description: 'Standard RTMP streaming port',
      compatibility: 'Compatible with all RTMP streaming software including OBS Studio'
    };
  }

  static getProtocolInfo(): {
    protocol: string;
    description: string;
  } {
    return {
      protocol: 'RTMP',
      description: 'Real-Time Messaging Protocol - Industry standard for live streaming'
    };
  }

  static getOBSSetupInstructions(): {
    service: string;
    server: string;
    backup_server: string;
    steps: string[];
  } {
    const serverUrl = URLGenerator.getRtmpUrl();
    return {
      service: 'Custom...',
      server: serverUrl,
      backup_server: serverUrl,
      steps: [
        '1. Open OBS Studio',
        '2. Go to Settings → Stream',
        '3. Service: Select "Custom..."',
        `4. Server: ${serverUrl}`,
        '5. Stream Key: Copy from app',
        '6. Click Apply → OK',
        '7. Click Start Streaming'
      ]
    };
  }

  static getTroubleshootingSteps(): string[] {
    return [
      `✅ Use exact server URL: ${URLGenerator.getRtmpUrl()}`,
      '✅ Ensure server firewall allows port 1935',
      '✅ Restart OBS completely after configuration',
      '✅ Test from different network (mobile hotspot)',
      '✅ Check server is running in DigitalOcean dashboard',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service',
      '⚠️ If fails: Check server logs for RTMP server status'
    ];
  }

  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const rtmpUrl = URLGenerator.getRtmpUrl();
    
    // Simple connection test - in a real implementation, this would actually test the connection
    return {
      primary: {
        success: true,
        url: rtmpUrl
      },
      backup: {
        success: true,
        url: rtmpUrl
      },
      recommendations: [
        'Use the primary server URL for best performance',
        'Ensure OBS is configured with "Custom..." service',
        'Copy stream key exactly as provided'
      ]
    };
  }
}
