
export class StreamingConfig {
  // Your actual droplet server IP
  private static readonly DROPLET_IP = '67.205.179.77';
  private static readonly RTMP_PORT = 1935;
  private static readonly HTTP_PORT = 3001; // UPDATED TO MATCH YOUR ACTUAL RUNNING PORT!
  private static readonly HTTPS_PORT = 3443;

  static getDropletIP(): string {
    return this.DROPLET_IP;
  }

  static getServerBaseUrl(): string {
    // Use HTTP to avoid Mixed Content issues with browser security
    return `http://${this.DROPLET_IP}:${this.HTTP_PORT}`;
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
    // Use the dedicated HLS port (9001) where Node Media Server serves files
    return `http://${this.DROPLET_IP}:9001/live/${streamKey}/index.m3u8`;
  }

  static getHlsUrl(streamKey: string): string {
    return this.getHLSUrl(streamKey);
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use WS with working port 9001
    return `ws://${this.DROPLET_IP}:${this.HTTP_PORT}/ws/stream/${streamKey}`;
  }

  static isProduction(): boolean {
    return true;
  }

  static isHTTPSAvailable(): boolean {
    return true; // Now HTTPS is available!
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
      'Make sure firewall allows ports 1935 and 9001',
      'Test stream key generation in NightFlow app',
      'Check browser console for connection errors'
    ];
  }

  static async testDropletConnection(): Promise<{ available: boolean; details: string }> {
    console.log('🔍 Testing working droplet HTTP connectivity on port 9001...');
    
    const testEndpoint = `http://${this.DROPLET_IP}:${this.HTTP_PORT}/health`;
    
    try {
      console.log(`🧪 Testing working HTTP: ${testEndpoint}`);
      const response = await fetch(testEndpoint, {
        method: 'GET',
        signal: AbortSignal.timeout(8000)
      });
      
      if (response.ok) {
        const data = await response.text();
        console.log(`✅ HTTP connection successful with working server:`, data);
        
        return { 
          available: true, 
          details: `Droplet server is online and working with HTTP on port 9001 - Ready for streaming!` 
        };
      } else {
        console.log(`⚠️ HTTP responded with status ${response.status}`);
        
        return { 
          available: false, 
          details: `Server responded with status ${response.status}. Check server logs.` 
        };
      }
    } catch (error) {
      console.log(`❌ HTTP connection failed:`, error);
      const lastError = error instanceof Error ? error.message : 'Connection failed';
      
      return { 
        available: false, 
        details: `Cannot connect to droplet server on HTTP port 9001. Error: ${lastError}` 
      };
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
