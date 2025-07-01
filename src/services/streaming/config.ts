export class StreamingConfig {
  // Your actual droplet server IP
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly RTMP_PORT = 1935;
  private static readonly HTTP_PORT = 3001;
  private static readonly HTTPS_PORT = 3443;

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static getServerBaseUrl(): string {
    // Always try HTTPS first since we set it up
    return `https://${this.DROPLET_IP}:${this.HTTPS_PORT}`;
  }

  static getApiBaseUrl(): string {
    return this.getServerBaseUrl();
  }

  static getOBSServerUrl(): string {
    return `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
  }

  static getRtmpUrl(): string {
    return `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
  }

  static getHLSUrl(streamKey: string): string {
    // Use HTTPS for HLS streaming to avoid mixed content
    return `https://${this.DROPLET_IP}:${this.HTTPS_PORT}/live/${streamKey}/index.m3u8`;
  }

  static getHlsUrl(streamKey: string): string {
    return this.getHLSUrl(streamKey);
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WSS for secure WebSocket connection
    return `wss://${this.DROPLET_IP}:${this.HTTPS_PORT}/ws/stream/${streamKey}`;
  }

  static isProduction(): boolean {
    return true; // Always production when using actual droplet
  }

  static isHTTPSAvailable(): boolean {
    // We know HTTPS is available since we just set it up
    return true;
  }

  static getPortInfo(): { rtmpPort: number; description: string; compatibility: string } {
    return {
      rtmpPort: this.RTMP_PORT,
      description: 'Standard RTMP streaming port',
      compatibility: 'Compatible with all RTMP streaming software including OBS Studio'
    };
  }

  static getProtocolInfo(): { protocol: string; description: string } {
    return {
      protocol: 'RTMP',
      description: 'Real-Time Messaging Protocol - Industry standard for live streaming'
    };
  }

  static getOBSSetupInstructions(): { 
    server: string; 
    backup_server: string;
    streamKey: string; 
    settings: string[];
    steps: string[];
  } {
    const serverUrl = `rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`;
    return {
      server: serverUrl,
      backup_server: serverUrl, // Same server for backup
      streamKey: 'Generate from NightFlow app',
      settings: [
        'Service: Custom',
        `Server: rtmp://${this.DROPLET_IP}:${this.RTMP_PORT}/live`,
        'Stream Key: [Your generated key]',
        'Output Resolution: 1920x1080',
        'Bitrate: 2500-6000 kbps'
      ],
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
      'Check if your droplet server is running in PowerShell',
      'Verify OBS is connected (should show "OBS SUCCESSFULLY CONNECTED!")',
      'Make sure firewall allows ports 1935 and 3001',
      'Test stream key generation in NightFlow app',
      'Check browser console for connection errors'
    ];
  }

  static async testDropletConnection(): Promise<{ available: boolean; details: string }> {
    try {
      // Test HTTPS first since we set it up
      const httpsResponse = await fetch(`https://${this.DROPLET_IP}:${this.HTTPS_PORT}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (httpsResponse.ok) {
        return { 
          available: true, 
          details: 'Droplet server is online with HTTPS support - perfect for NightFlow!' 
        };
      } else {
        return { 
          available: false, 
          details: `Droplet HTTPS server responded with status ${httpsResponse.status}` 
        };
      }
    } catch (error) {
      // Fallback to HTTP test
      try {
        const response = await fetch(`http://${this.DROPLET_IP}:${this.HTTP_PORT}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          return { 
            available: true, 
            details: 'Droplet server is online (HTTP only) - HTTPS setup may need troubleshooting' 
          };
        } else {
          return { 
            available: false, 
            details: `Droplet server responded with status ${response.status}` 
          };
        }
      } catch (httpError) {
        return { 
          available: false, 
          details: `Cannot connect to droplet: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
    }
  }

  static async testRTMPConnection(): Promise<{ 
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const primaryUrl = this.getOBSServerUrl();
    const apiUrl = `${this.getApiBaseUrl()}/api/rtmp/status`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const primaryResult = {
        success: response.ok,
        url: primaryUrl,
        error: response.ok ? undefined : `Status: ${response.status}`
      };

      return {
        primary: primaryResult,
        backup: {
          success: false,
          url: primaryUrl,
          error: 'Backup not configured'
        },
        recommendations: response.ok ? [
          'RTMP server is ready for OBS streaming',
          'Use the exact server URL provided',
          'Generate a fresh stream key if needed'
        ] : [
          'Check if your droplet server is running',
          'Verify firewall allows port 1935',
          'Try restarting your droplet server'
        ]
      };
    } catch (error) {
      return {
        primary: {
          success: false,
          url: primaryUrl,
          error: error instanceof Error ? error.message : 'Connection failed'
        },
        backup: {
          success: false,
          url: primaryUrl,
          error: 'Backup not available'
        },
        recommendations: [
          'Check if your droplet server is running in DigitalOcean dashboard',
          'Verify your droplet IP address is correct',
          'Ensure firewall rules allow RTMP traffic on port 1935',
          'Try accessing your droplet via SSH to check server status'
        ]
      };
    }
  }
}
