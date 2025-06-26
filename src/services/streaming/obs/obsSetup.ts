
import { URLGenerator } from '../core/urlGenerator';
import { EnvironmentConfig } from '../core/environment';

export class OBSSetup {
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
    const serverUrl = URLGenerator.getOBSServerUrl();
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
      `✅ Use exact server URL: ${URLGenerator.getOBSServerUrl()}`,
      '✅ Ensure Droplet firewall allows port 1935',
      '✅ Restart OBS completely after configuration',
      '✅ Test from different network (mobile hotspot)',
      '✅ Check Droplet is running in DigitalOcean dashboard',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service',
      '⚠️ If fails: SSH into Droplet and check RTMP server status'
    ];
  }
}
