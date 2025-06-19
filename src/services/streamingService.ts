
import { supabase } from '@/lib/supabase';
import { StreamingConfig } from './streaming/config';
import { StreamingDatabase } from './streaming/database';
import { StreamingAPI } from './streaming/api';
import { StreamingMonitor } from './streaming/monitor';
import type { StreamConfig, StreamStatus } from '@/types/streaming';

class StreamingService {
  private monitor = new StreamingMonitor();

  async generateStreamKey(): Promise<StreamConfig> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to generate a stream key');
    }

    // Check server availability first
    const serverStatus = await StreamingAPI.getServerStatus();
    if (!serverStatus.available) {
      throw new Error('Streaming server is not available. Please check deployment.');
    }

    // Generate secure stream key
    const streamKey = StreamingConfig.generateStreamKey(user.id);
    
    const config: StreamConfig = {
      rtmpUrl: StreamingConfig.getRtmpUrl(),
      streamKey,
      hlsUrl: StreamingConfig.getHlsUrl(streamKey),
      isLive: false,
      viewerCount: 0
    };

    // Save stream to database
    await StreamingDatabase.saveStream(config, user.id);

    // Store in localStorage as backup
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    return config;
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    return await StreamingDatabase.getCurrentStream(user.id);
  }

  async revokeStreamKey(): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to revoke stream key');
    }

    await StreamingDatabase.revokeStream(user.id);
    localStorage.removeItem('nightflow_stream_config');
    this.disconnect();
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    return await StreamingAPI.getStreamStatus(streamKey);
  }

  connectToStreamStatusWebSocket(streamKey: string) {
    this.monitor.connectToStreamStatusWebSocket(streamKey);
  }

  onStatusUpdate(callback: (status: StreamStatus) => void) {
    return this.monitor.onStatusUpdate(callback);
  }

  disconnect() {
    this.monitor.disconnect();
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    return await StreamingDatabase.validateStreamKey(streamKey);
  }

  async getServerStatus(): Promise<{ available: boolean; url: string }> {
    return await StreamingAPI.getServerStatus();
  }
}

export const streamingService = new StreamingService();
export type { StreamConfig, StreamStatus };
