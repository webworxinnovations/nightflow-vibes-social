
import { StreamingConfig } from './config';
import type { StreamStatus } from '@/types/streaming';

export class StreamingAPI {
  static async getServerStatus(): Promise<{ available: boolean; url: string }> {
    const baseUrl = StreamingConfig.getBaseUrl();
    
    try {
      console.log('🔍 Checking server status at:', `${baseUrl}/health`);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout for better error handling
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Streaming server health check passed:', data);
        return {
          available: true,
          url: baseUrl
        };
      } else {
        console.warn('⚠️ Streaming server health check failed:', response.status, response.statusText);
        return {
          available: false,
          url: baseUrl
        };
      }
    } catch (error) {
      console.error('❌ Failed to check streaming server status:', error);
      return {
        available: false,
        url: baseUrl
      };
    }
  }

  static async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    const baseUrl = StreamingConfig.getBaseUrl();
    
    try {
      console.log('📊 Checking stream status for:', streamKey);
      
      const response = await fetch(`${baseUrl}/api/stream/${streamKey}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const status = await response.json();
        console.log('📈 Stream status received:', status);
        return status;
      } else {
        console.log('📉 Stream not found or offline');
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
      console.error('❌ Failed to get stream status:', error);
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
      console.log('🔑 Validating stream key:', streamKey);
      
      const response = await fetch(`${baseUrl}/api/stream/${streamKey}/validate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stream key validation result:', data);
        return data.valid === true;
      } else {
        console.log('❌ Stream key validation failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to validate stream key:', error);
      return false;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const status = await this.getServerStatus();
      return status.available;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}
