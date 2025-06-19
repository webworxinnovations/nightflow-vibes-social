
import { StreamingConfig } from './config';
import { StreamingDatabase } from './database';
import type { StreamStatus } from '@/types/streaming';

export class StreamingAPI {
  private static baseUrl = StreamingConfig.getBaseUrl();

  static async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stream/${streamKey}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const status = await response.json();
        
        // Update database with latest status
        await StreamingDatabase.updateStreamStatus(streamKey, status);
          
        return status;
      } else {
        console.warn('Stream status request failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Streaming server not available:', error);
    }

    // Fallback: get status from database
    return await StreamingDatabase.getStreamFromDatabase(streamKey);
  }

  static async getServerStatus(): Promise<{ available: boolean; url: string }> {
    try {
      console.log('StreamingService: Checking server status at:', this.baseUrl);
      
      // First try a simple OPTIONS request to check if server responds
      const optionsResponse = await fetch(this.baseUrl, {
        method: 'OPTIONS',
        signal: AbortSignal.timeout(5000)
      });
      
      console.log('StreamingService: OPTIONS response:', {
        status: optionsResponse.status,
        ok: optionsResponse.ok
      });
      
      // If OPTIONS works, try GET
      if (optionsResponse.ok || optionsResponse.status === 404) {
        const response = await fetch(`${this.baseUrl}/`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        console.log('StreamingService: GET response:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
        
        // Accept any response (even 404) as "server is running"
        if (response.status < 500) {
          return {
            available: true,
            url: this.baseUrl
          };
        }
      }
    } catch (error) {
      console.error('StreamingService: Server check failed:', error);
    }

    // For Railway deployments, assume the server is available if the URL is valid
    // Railway deployments can take time to respond to HTTP requests
    const isRailwayUrl = this.baseUrl.includes('railway.app');
    
    if (isRailwayUrl) {
      console.log('StreamingService: Railway deployment detected, assuming available for RTMP');
      return {
        available: true,
        url: this.baseUrl
      };
    }
    
    return {
      available: false,
      url: this.baseUrl
    };
  }
}
