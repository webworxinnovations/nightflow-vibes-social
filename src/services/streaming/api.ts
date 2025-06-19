
import { StreamingConfig } from './config';
import type { StreamStatus } from '@/types/streaming';

export class StreamingAPI {
  static async getServerStatus(): Promise<{ available: boolean; url: string }> {
    const baseUrl = StreamingConfig.getBaseUrl();
    
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Streaming server health check:', data);
        return {
          available: true,
          url: baseUrl
        };
      } else {
        console.warn('Streaming server health check failed:', response.status);
        return {
          available: false,
          url: baseUrl
        };
      }
    } catch (error) {
      console.error('Failed to check streaming server status:', error);
      return {
        available: false,
        url: baseUrl
      };
    }
  }

  static async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    const baseUrl = StreamingConfig.getBaseUrl();
    
    try {
      const response = await fetch(`${baseUrl}/api/stream/${streamKey}/status`);
      
      if (response.ok) {
        const status = await response.json();
        return status;
      } else {
        // Return default offline status
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

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    const baseUrl = StreamingConfig.getBaseUrl();
    
    try {
      const response = await fetch(`${baseUrl}/api/stream/${streamKey}/validate`);
      
      if (response.ok) {
        const data = await response.json();
        return data.valid === true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to validate stream key:', error);
      return false;
    }
  }
}
