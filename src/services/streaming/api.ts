
export class StreamingAPI {
  static async getServerStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }> {
    try {
      console.log('🔍 Checking DigitalOcean server status...');
      const baseUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      
      // Test if the API server is responding
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ DigitalOcean server is online and ready');
        
        return {
          available: true,
          url: baseUrl,
          version: data.version || '1.0.0',
          uptime: data.uptime || 0
        };
      } else {
        console.error('❌ DigitalOcean server not responding:', response.status);
        return { available: false, url: baseUrl };
      }
    } catch (error) {
      console.error('❌ DigitalOcean server status check failed:', error);
      return {
        available: false,
        url: 'https://nightflow-app-wijb2.ondigitalocean.app'
      };
    }
  }

  static async getStreamStatus(streamKey: string) {
    try {
      const baseUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      const response = await fetch(`${baseUrl}/api/stream/${streamKey}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Real stream status received:', data);
        return {
          isLive: data.isLive || false,
          viewerCount: data.viewerCount || 0,
          duration: data.duration || 0,
          bitrate: data.bitrate || 0,
          resolution: data.resolution || '',
          timestamp: new Date().toISOString()
        };
      } else {
        console.log('Stream not found or offline');
        return {
          isLive: false,
          viewerCount: 0,
          duration: 0,
          bitrate: 0,
          resolution: '',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to get real stream status:', error);
      return {
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      };
    }
  }

  static async testRtmpConnection(streamKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const baseUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      const response = await fetch(`${baseUrl}/api/rtmp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ streamKey }),
        signal: AbortSignal.timeout(15000)
      });
      
      if (response.ok) {
        return {
          success: true,
          message: 'RTMP server is ready and accepting connections'
        };
      } else {
        return {
          success: false,
          message: `RTMP server test failed: ${response.status} - ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `RTMP connection test failed: ${error instanceof Error ? error.message : 'Network error'}`
      };
    }
  }
}
