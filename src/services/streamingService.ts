
import { StreamingAPI } from './streaming/api';
import { ServerStatusChecker } from './streaming/serverStatusChecker';
import { WebSocketManager } from './streaming/websocketManager';
import { StreamConfig, StreamStatus } from '@/types/streaming';
import { supabase } from '@/integrations/supabase/client';

class StreamingService {
  private wsManager = new WebSocketManager();

  async generateStreamKey(): Promise<StreamConfig> {
    try {
      // Check if DigitalOcean droplet server is available first
      const serverStatus = await this.getServerStatus();
      if (!serverStatus.available) {
        console.warn('🟡 DigitalOcean droplet server offline - generating key for when server comes online');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate a unique stream key
      const streamKey = `nf_${user.id.split('-')[0]}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use DigitalOcean droplet IP directly - NO domain names
      const rtmpUrl = `rtmp://67.205.179.77:1935/live`;
      const hlsUrl = `http://67.205.179.77:3001/live/${streamKey}/index.m3u8`;

      const streamConfig: StreamConfig = {
        streamKey,
        rtmpUrl,
        hlsUrl
      };

      // First, deactivate any existing streams for this user to avoid conflicts
      const { error: deactivateError } = await supabase
        .from('streams')
        .update({
          is_active: false,
          status: 'offline',
          ended_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (deactivateError) {
        console.warn('Could not deactivate existing streams:', deactivateError);
      }

      // Insert new stream record
      const { error } = await supabase
        .from('streams')
        .insert({
          user_id: user.id,
          stream_key: streamKey,
          rtmp_url: rtmpUrl,
          hls_url: hlsUrl,
          status: 'offline',
          is_active: true,
          title: 'Live Stream',
          description: 'Professional DJ Stream'
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save stream configuration');
      }

      console.log('🎯 Stream key generated for DigitalOcean droplet:', streamConfig);
      console.log('✅ RTMP URL (for OBS):', rtmpUrl);
      console.log('✅ HLS URL (for playback):', hlsUrl);
      return streamConfig;

    } catch (error) {
      console.error('Failed to generate stream key:', error);
      throw error;
    }
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('streams')
        .select('stream_key, rtmp_url, hls_url')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        return null;
      }

      if (!data) return null;

      const streamConfig = {
        streamKey: data.stream_key,
        rtmpUrl: data.rtmp_url,
        hlsUrl: data.hls_url
      };

      console.log('✅ Current stream loaded from database:', streamConfig);
      return streamConfig;

    } catch (error) {
      console.error('Failed to get current stream:', error);
      return null;
    }
  }

  async revokeStreamKey(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('streams')
        .update({ 
          is_active: false, 
          status: 'offline',
          ended_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Disconnect websocket
      this.wsManager.disconnect();

    } catch (error) {
      console.error('Failed to revoke stream key:', error);
      throw error;
    }
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      // Basic format validation
      if (!streamKey || streamKey.length < 10 || !streamKey.startsWith('nf_')) {
        return false;
      }

      // Check database
      const { data, error } = await supabase
        .from('streams')
        .select('stream_key')
        .eq('stream_key', streamKey)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Validation error:', error);
        return false;
      }

      return data !== null;

    } catch (error) {
      console.error('Stream key validation failed:', error);
      return false;
    }
  }

  async getServerStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }> {
    try {
      console.log('🔍 Testing DigitalOcean droplet server connectivity...');
      console.log(`📡 Testing server at: http://67.205.179.77:3001/health`);
      
      // Handle mixed content gracefully - try different approaches
      const testUrls = [
        'http://67.205.179.77:3001/health',
        'http://67.205.179.77:3001/',
        'http://67.205.179.77:3001/api/server/stats'
      ];

      for (const testUrl of testUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal,
            mode: 'cors'
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            console.log('✅ DigitalOcean droplet server is online and responding');
            
            return {
              available: true,
              url: 'http://67.205.179.77:3001',
              version: data.version || 'unknown',
              uptime: data.uptime || 0
            };
          }
        } catch (error) {
          console.warn(`⚠️ Failed to test ${testUrl}:`, error);
          continue;
        }
      }

      console.warn('⚠️ All server connectivity tests failed');
      return { available: false, url: 'http://67.205.179.77:3001' };

    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity test failed:', error);
      console.error('💡 This is likely due to mixed content (HTTPS->HTTP) restrictions');
      console.error('💡 Please access your app via HTTP or enable HTTPS on your droplet');
      return { available: false, url: 'http://67.205.179.77:3001' };
    }
  }

  connectToStreamStatusWebSocket(streamKey: string): void {
    try {
      this.wsManager.connectToStreamStatus(streamKey);
    } catch (error) {
      console.warn('WebSocket connection failed (likely due to mixed content):', error);
    }
  }

  onStatusUpdate(callback: (status: StreamStatus) => void): () => void {
    return this.wsManager.onStatusUpdate(callback);
  }

  disconnect(): void {
    this.wsManager.disconnect();
  }
}

export const streamingService = new StreamingService();
