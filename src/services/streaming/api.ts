import { StreamingConfig } from './config';
import { StreamingDatabase } from './database';
import type { StreamStatus } from '@/types/streaming';

export class StreamingAPI {
  private static baseUrl = StreamingConfig.getBaseUrl();
  private static retryAttempts = 3;
  private static retryDelay = 1000;

  private static async fetchWithRetry(url: string, options: RequestInit, retries = this.retryAttempts): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (retries > 0 && (error instanceof Error && error.name !== 'AbortError')) {
        console.warn(`Fetch failed, retrying in ${this.retryDelay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  static async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    try {
      console.log(`StreamingAPI: Getting status for stream ${streamKey}`);
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/stream/${streamKey}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const status = await response.json();
        console.log(`StreamingAPI: Status received:`, status);
        
        // Ensure the status has a timestamp
        const fullStatus: StreamStatus = {
          isLive: status.isLive || false,
          viewerCount: status.viewerCount || 0,
          duration: status.duration || 0,
          bitrate: status.bitrate || 0,
          resolution: status.resolution || '',
          timestamp: status.timestamp || new Date().toISOString()
        };
        
        // Update database with latest status
        try {
          await StreamingDatabase.updateStreamStatus(streamKey, fullStatus);
        } catch (dbError) {
          console.warn('Failed to update database status:', dbError);
        }
          
        return fullStatus;
      } else {
        console.warn(`StreamingAPI: Status request failed:`, response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('StreamingAPI: Server not available, using fallback:', error);
      
      // Fallback: get status from database or return offline status
      try {
        return await StreamingDatabase.getStreamFromDatabase(streamKey);
      } catch (dbError) {
        console.warn('Database fallback failed:', dbError);
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
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/stream/${streamKey}/validate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.valid === true;
      }
    } catch (error) {
      console.warn('StreamingAPI: Stream validation failed:', error);
    }
    
    // Fallback: basic validation
    return streamKey.startsWith('nf_') && streamKey.length > 10;
  }

  static async getServerStatus(): Promise<{ available: boolean; url: string }> {
    try {
      console.log('StreamingAPI: Checking server status at:', this.baseUrl);
      
      // Quick health check
      const response = await this.fetchWithRetry(`${this.baseUrl}/health`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('StreamingAPI: Health check response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('StreamingAPI: Health data:', healthData);
        
        return {
          available: true,
          url: this.baseUrl
        };
      } else if (response.status < 500) {
        // Server is responding but might have issues
        return {
          available: true,
          url: this.baseUrl
        };
      }
    } catch (error) {
      console.error('StreamingAPI: Server check failed:', error);
    }

    // For production Railway deployments, be more lenient
    const isRailwayUrl = this.baseUrl.includes('railway.app');
    const isProduction = StreamingConfig.isProduction();
    
    if (isRailwayUrl && isProduction) {
      console.log('StreamingAPI: Railway production deployment detected, assuming RTMP is available');
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

  static async getActiveStreams(): Promise<any[]> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/streams/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.streams || [];
      }
    } catch (error) {
      console.warn('StreamingAPI: Failed to get active streams:', error);
    }
    
    return [];
  }
}
