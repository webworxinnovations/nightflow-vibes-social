
export class StreamingConfig {
  static getOBSServerUrl(): string {
    // OBS needs just the RTMP server URL
    return 'rtmp://67.205.179.77:1935';
  }

  static getApiBaseUrl(): string {
    // Use droplet IP for all API calls
    return 'http://67.205.179.77:3001';
  }

  static getRtmpUrl(): string {
    // Full RTMP URL with /live path
    return `${this.getOBSServerUrl()}/live`;
  }

  static getHlsUrl(streamKey: string): string {
    // Use droplet IP for HLS playback
    return `${this.getApiBaseUrl()}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    // Use droplet IP for WebSocket
    return `ws://67.205.179.77:3001/ws/stream/${streamKey}`;
  }

  static isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }

  static getPortInfo(): {
    rtmpPort: number;
    description: string;
    compatibility: string;
  } {
    return {
      rtmpPort: 1935,
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

  static getTroubleshootingSteps(): string[] {
    return [
      `✅ Use exact server URL: ${this.getOBSServerUrl()}`,
      '✅ Ensure DigitalOcean droplet is running on 67.205.179.77',
      '✅ Restart OBS completely after configuration',
      '✅ Test from different network (mobile hotspot)',
      '✅ Check droplet firewall allows port 1935 (RTMP)',
      '✅ Check droplet firewall allows port 3001 (HTTP/WebSocket)',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service',
      '⚠️ If fails: SSH into droplet and check service status'
    ];
  }

  static getOBSSetupInstructions() {
    return {
      server: this.getOBSServerUrl(),
      backup_server: this.getOBSServerUrl(),
      steps: [
        'Open OBS Studio',
        'Go to Settings → Stream',
        'Service: Select "Custom..."',
        `Server: ${this.getOBSServerUrl()}/live`,
        'Stream Key: Copy your generated stream key',
        'Click "Apply" → "OK"',
        'Click "Start Streaming" in main OBS window'
      ]
    };
  }

  static async testRTMPConnection() {
    const serverUrl = this.getOBSServerUrl();
    
    console.log('🧪 Testing RTMP server connectivity...');
    console.log('Server URL:', serverUrl);
    
    const testUrl = `${this.getApiBaseUrl()}/health`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });
      
      const result = {
        primary: {
          success: response.ok,
          url: serverUrl,
          error: response.ok ? null : `HTTP ${response.status}`
        },
        backup: {
          success: response.ok,
          url: serverUrl,
          error: response.ok ? null : `HTTP ${response.status}`
        },
        recommendations: response.ok ? [
          'RTMP server is ready for OBS connections',
          'Use the exact server URL shown above',
          'Ensure your stream key is correct',
          'Start streaming from OBS'
        ] : [
          'Check if DigitalOcean droplet is running',
          'Verify server deployment status',
          'Try again in a few moments'
        ]
      };
      
      console.log('🧪 Connection test result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      
      return {
        primary: {
          success: false,
          url: serverUrl,
          error: error instanceof Error ? error.message : 'Connection failed'
        },
        backup: {
          success: false,
          url: serverUrl,
          error: 'Backup test also failed'
        },
        recommendations: [
          'Check internet connection',
          'Verify DigitalOcean droplet is deployed',
          'Try again later'
        ]
      };
    }
  }
}
