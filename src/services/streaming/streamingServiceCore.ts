
import { StreamConfig, StreamStatus } from '@/types/streaming';
import { StreamingServiceInterface } from './types';
import { StreamKeyGenerator } from './streamKeyGenerator';
import { DatabaseService } from './databaseService';
import { ServerStatusChecker } from './serverStatusChecker';
import { WebSocketManager } from './websocketManager';
import { supabase } from '@/integrations/supabase/client';

export class StreamingServiceCore implements StreamingServiceInterface {
  private websocketManager = new WebSocketManager();

  async generateStreamKey(): Promise<StreamConfig> {
    console.log('🎯 Generating stream key...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Getting current stream for user:', user.id);

      // First, deactivate any existing streams
      await this.revokeStreamKey();

      // Generate new stream key
      const streamKey = StreamKeyGenerator.generate(user.id);
      const { rtmpUrl, hlsUrl } = StreamKeyGenerator.generateUrls(streamKey);

      // Save to database
      await DatabaseService.saveStream(user.id, streamKey, rtmpUrl, hlsUrl);

      const config: StreamConfig = {
        streamKey,
        rtmpUrl,
        hlsUrl,
        isLive: false,
        viewerCount: 0
      };

      console.log('✅ Stream configuration generated:', config);
      console.log('✅ OBS Server URL (for settings):', rtmpUrl);
      
      return config;
    } catch (error) {
      console.error('❌ Failed to generate stream key:', error);
      throw error;
    }
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return await DatabaseService.getCurrentStream(user.id);
    } catch (error) {
      console.error('❌ Failed to get current stream:', error);
      return null;
    }
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    return await DatabaseService.validateStreamKey(streamKey);
  }

  async revokeStreamKey(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Disconnect WebSocket first
      this.disconnect();

      await DatabaseService.revokeStream(user.id);
    } catch (error) {
      console.error('❌ Failed to revoke stream:', error);
      throw error;
    }
  }

  async getServerStatus() {
    return await ServerStatusChecker.checkStatus();
  }

  connectToStreamStatusWebSocket(streamKey: string): void {
    this.websocketManager.connectToStreamStatus(streamKey);
  }

  onStatusUpdate(callback: (status: StreamStatus) => void): () => void {
    return this.websocketManager.onStatusUpdate(callback);
  }

  disconnect(): void {
    console.log('🔌 Streaming service disconnected');
    this.websocketManager.disconnect();
  }
}
