
import { StreamingConfig } from './streaming/config';
import { StreamingDatabase } from './streaming/database';
import { StreamingAPI } from './streaming/api';
import { supabase } from '@/lib/supabase';
import { StreamConfig, StreamStatus } from '@/types/streaming';

export interface ServerStatus {
  available: boolean;
  url: string;
  version?: string;
  uptime?: number;
}

type StatusUpdateCallback = (status: StreamStatus) => void;

class StreamingService {
  private statusCallbacks: StatusUpdateCallback[] = [];
  private websocket: WebSocket | null = null;
  private currentStreamKey: string | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;

  async generateStreamKey(): Promise<StreamConfig> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const streamKey = StreamingConfig.generateStreamKey(user.id);
      const rtmpUrl = StreamingConfig.getRtmpUrl();
      const hlsUrl = StreamingConfig.getHlsUrl(streamKey);

      const config: StreamConfig = {
        rtmpUrl,
        streamKey,
        hlsUrl,
        isLive: false,
        viewerCount: 0
      };

      await StreamingDatabase.saveStream(config, user.id);
      
      console.log('✅ Stream configuration generated:', { streamKey, rtmpUrl, hlsUrl });
      return config;
    } catch (error) {
      console.error('❌ Failed to generate stream key:', error);
      throw error;
    }
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      return await StreamingDatabase.getCurrentStream(user.id);
    } catch (error) {
      console.error('Failed to get current stream:', error);
      return null;
    }
  }

  async revokeStreamKey(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      await StreamingDatabase.revokeStream(user.id);
      this.disconnect();
      console.log('✅ Stream key revoked');
    } catch (error) {
      console.error('❌ Failed to revoke stream key:', error);
      throw error;
    }
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      return await StreamingDatabase.validateStreamKey(streamKey);
    } catch (error) {
      console.error('Stream key validation failed:', error);
      return false;
    }
  }

  async getServerStatus(): Promise<ServerStatus> {
    try {
      // For demo purposes, simulate server status check
      const mockStatus: ServerStatus = {
        available: Math.random() > 0.3, // 70% chance of being available
        url: 'https://nightflow-vibes-social-production.up.railway.app',
        version: '1.0.0',
        uptime: Math.floor(Math.random() * 86400) // Random uptime in seconds
      };
      
      console.log('Server status checked:', mockStatus);
      return mockStatus;
    } catch (error) {
      console.error('Failed to get server status:', error);
      return {
        available: false,
        url: 'https://nightflow-vibes-social-production.up.railway.app'
      };
    }
  }

  connectToStreamStatusWebSocket(streamKey: string) {
    this.currentStreamKey = streamKey;
    
    // Only start simulation when explicitly connected to a stream
    // and don't auto-trigger status changes
    console.log('Connected to stream monitoring for key:', streamKey);
  }

  // Remove the automatic simulation that was causing random toasts
  private simulateStreamStatus() {
    // This method is now empty to prevent random status updates
    console.log('Stream status monitoring active (simulation disabled)');
  }

  onStatusUpdate(callback: StatusUpdateCallback): () => void {
    this.statusCallbacks.push(callback);
    
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStatusUpdate(status: StreamStatus) {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Status update callback error:', error);
      }
    });
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    this.currentStreamKey = null;
  }
}

export const streamingService = new StreamingService();
