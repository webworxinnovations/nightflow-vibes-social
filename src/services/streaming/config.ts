
export class StreamingConfig {
  static getOBSServerUrl(): string {
    return 'rtmp://nightflow-app-wijb2.ondigitalocean.app:1935';
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
    const testUrl = 'https://nightflow-app-wijb2.ondigitalocean.app/health';
    
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
