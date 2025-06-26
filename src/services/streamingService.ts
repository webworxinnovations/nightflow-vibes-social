
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

  async generateStreamKey(): Promise<StreamConfig> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const streamKey = StreamingConfig.generateStreamKey(user.id);
      const rtmpUrl = StreamingConfig.getRtmpUrl(); // This now includes /live
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
      console.log('✅ OBS Server URL (for settings):', StreamingConfig.getOBSServerUrl());
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
      console.log('🔍 Checking DigitalOcean server status...');
      const baseUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ DigitalOcean server is online and responding');
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

  connectToStreamStatusWebSocket(streamKey: string) {
    this.currentStreamKey = streamKey;
    
    try {
      const wsUrl = `wss://nightflow-app-wijb2.ondigitalocean.app/ws/stream/${streamKey}`;
      console.log('🔌 Connecting to real-time stream status:', wsUrl);
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('✅ WebSocket connected for stream monitoring');
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const status: StreamStatus = JSON.parse(event.data);
          console.log('📊 Real-time status update:', status);
          this.notifyStatusUpdate(status);
        } catch (error) {
          console.error('Failed to parse status update:', error);
        }
      };
      
      this.websocket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.currentStreamKey) {
            console.log('🔄 Attempting to reconnect WebSocket...');
            this.connectToStreamStatusWebSocket(this.currentStreamKey);
          }
        }, 5000);
      };
      
      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
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
    console.log('🔌 Streaming service disconnected');
  }
}

export const streamingService = new StreamingService();
