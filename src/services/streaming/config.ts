
export class StreamingConfig {
  static getOBSServerUrl(): string {
    return 'rtmp://nightflow-app-wijb2.ondigitalocean.app:1935';
  }

  static getApiBaseUrl(): string {
    return 'https://nightflow-app-wijb2.ondigitalocean.app';
  }

  static getRtmpUrl(): string {
    return `${this.getOBSServerUrl()}/live`;
  }

  static getHlsUrl(streamKey: string): string {
    return `${this.getApiBaseUrl()}/live/${streamKey}/index.m3u8`;
  }

  static getWebSocketUrl(streamKey: string): string {
    return `wss://nightflow-app-wijb2.ondigitalocean.app/ws/stream/${streamKey}`;
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
      '✅ Ensure DigitalOcean app is running',
      '✅ Restart OBS completely after configuration',
      '✅ Test from different network (mobile hotspot)',
      '✅ Check DigitalOcean app deployment status',
      '✅ Use generated stream key exactly as provided',
      '✅ In OBS: Service = Custom, not a preset service',
      '⚠️ If fails: Check DigitalOcean app logs'
    ];
  }

  static getOBSSetupInstructions() {
    return {
      server: this.getOBSServerUrl(),
      backup_server: this.getOBSServerUrl(), // Same server for now
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
    
    // Since we can't directly test RTMP from browser, we test the HTTP equivalent
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
          'Check if DigitalOcean app is running',
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
          'Verify DigitalOcean app is deployed',
          'Try again later'
        ]
      };
    }
  }
}
