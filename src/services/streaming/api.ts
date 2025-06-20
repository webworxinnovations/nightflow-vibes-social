
export class StreamingAPI {
  static async getServerStatus(): Promise<{ available: boolean; url: string }> {
    try {
      console.log('🔍 Checking server status...');
      const baseUrl = 'https://nightflow-vibes-social-production.up.railway.app';
      
      // Test if the API server is responding
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        console.log('✅ API server is responding');
        
        // Test if RTMP server info is available
        try {
          const rtmpStatus = await fetch(`${baseUrl}/api/rtmp/status`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          if (rtmpStatus.ok) {
            console.log('✅ RTMP server status available');
            return { available: true, url: baseUrl };
          } else {
            console.log('⚠️ RTMP server status not available, but API works');
            return { available: true, url: baseUrl };
          }
        } catch (rtmpError) {
          console.log('⚠️ RTMP status check failed, but API works');
          return { available: true, url: baseUrl };
        }
      } else {
        console.error('❌ API server not responding:', response.status);
        return { available: false, url: baseUrl };
      }
    } catch (error) {
      console.error('❌ Server status check failed:', error);
      return {
        available: false,
        url: 'https://nightflow-vibes-social-production.up.railway.app'
      };
    }
  }

  static async getStreamStatus(streamKey: string) {
    try {
      const baseUrl = 'https://nightflow-vibes-social-production.up.railway.app';
      const response = await fetch(`${baseUrl}/api/stream/${streamKey}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          isLive: data.isLive || false,
          viewerCount: data.viewerCount || 0,
          duration: data.duration || 0,
          bitrate: data.bitrate || 0,
          resolution: data.resolution || '',
          timestamp: new Date().toISOString()
        };
      } else {
        console.log('Stream status not available, returning defaults');
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
      console.error('Failed to get stream status:', error);
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
      const baseUrl = 'https://nightflow-vibes-social-production.up.railway.app';
      const response = await fetch(`${baseUrl}/api/rtmp/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ streamKey }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'RTMP server is ready to accept connections'
        };
      } else {
        return {
          success: false,
          message: `RTMP server test failed: ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `RTMP connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
