
import { StreamingConfig } from './streaming/config';
import { StreamingDatabase } from './streaming/database';
import { StreamingAPI } from './streaming/api';
import { supabase } from '@/lib/supabase';

export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl: string;
  isLive?: boolean;
  viewerCount?: number;
}

export interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  resolution: string;
  timestamp: string;
}

type StatusUpdateCallback = (status: StreamStatus) => void;

class StreamingService {
  private statusCallbacks: StatusUpdateCallback[] = [];
  private websocket: WebSocket | null = null;
  private currentStreamKey: string | null = null;

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

      // Save to database
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

  connectToStreamStatusWebSocket(streamKey: string) {
    this.currentStreamKey = streamKey;
    
    // Start with mock status since the streaming server isn't connected yet
    this.simulateStreamStatus();
  }

  private simulateStreamStatus() {
    // Simulate periodic status updates every 5 seconds
    setInterval(() => {
      const mockStatus: StreamStatus = {
        isLive: Math.random() > 0.7, // 30% chance of being live for demo
        viewerCount: Math.floor(Math.random() * 50),
        duration: Math.floor(Math.random() * 3600),
        bitrate: 2500 + Math.floor(Math.random() * 1000),
        resolution: '1920x1080',
        timestamp: new Date().toISOString()
      };

      this.notifyStatusUpdate(mockStatus);
    }, 5000);
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
    this.currentStreamKey = null;
  }
}

export const streamingService = new StreamingService();
