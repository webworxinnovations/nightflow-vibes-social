
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
      
      // Try the root endpoint first since /health might not exist
      const response = await fetch(`${this.baseUrl}/`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      });
      
      console.log('StreamingService: Server response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('StreamingService: Server health data:', data);
        return {
          available: true,
          url: this.baseUrl
        };
      } else {
        console.error('StreamingService: Server returned error:', response.status, response.statusText);
        return {
          available: false,
          url: this.baseUrl
        };
      }
    } catch (error) {
      console.error('StreamingService: Server check failed:', error);
      
      // Try health endpoint as fallback
      try {
        console.log('StreamingService: Trying health endpoint...');
        const healthResponse = await fetch(`${this.baseUrl}/health`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('StreamingService: Health endpoint works:', healthData);
          return {
            available: true,
            url: this.baseUrl
          };
        }
      } catch (healthError) {
        console.error('StreamingService: Health endpoint also failed:', healthError);
      }
      
      return {
        available: false,
        url: this.baseUrl
      };
    }
  }
}
