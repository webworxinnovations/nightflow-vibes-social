
import { supabase } from '@/lib/supabase';
import type { StreamConfig, StreamStatus } from '@/types/streaming';

export class StreamingDatabase {
  static async saveStream(config: StreamConfig, userId: string): Promise<any> {
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        stream_key: config.streamKey,
        rtmp_url: config.rtmpUrl,
        hls_url: config.hlsUrl,
        status: 'offline',
        is_active: true,
        viewer_count: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save stream to database:', error);
      throw new Error('Failed to generate stream key. Please try again.');
    }

    return stream;
  }

  static async getCurrentStream(userId: string): Promise<StreamConfig | null> {
    const { data: stream, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !stream) {
      return null;
    }

    return {
      rtmpUrl: stream.rtmp_url,
      streamKey: stream.stream_key,
      hlsUrl: stream.hls_url,
      isLive: stream.status === 'live',
      viewerCount: stream.viewer_count || 0
    };
  }

  static async revokeStream(userId: string): Promise<void> {
    const { error } = await supabase
      .from('streams')
      .update({ 
        is_active: false,
        status: 'offline',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to revoke stream in database:', error);
    }
  }

  static async updateStreamStatus(streamKey: string, status: StreamStatus): Promise<void> {
    await supabase
      .from('streams')
      .update({
        status: status.isLive ? 'live' : 'offline',
        viewer_count: status.viewerCount,
        duration: status.duration,
        bitrate: status.bitrate,
        resolution: status.resolution,
        updated_at: new Date().toISOString()
      })
      .eq('stream_key', streamKey);
  }

  static async getStreamFromDatabase(streamKey: string): Promise<StreamStatus> {
    const { data: stream } = await supabase
      .from('streams')
      .select('*')
      .eq('stream_key', streamKey)
      .single();

    if (stream) {
      return {
        isLive: stream.status === 'live',
        viewerCount: stream.viewer_count || 0,
        duration: stream.duration || 0,
        bitrate: stream.bitrate || 0,
        resolution: stream.resolution || '',
        timestamp: stream.updated_at || new Date().toISOString()
      };
    }

    return {
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: '',
      timestamp: new Date().toISOString()
    };
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      const { data: stream, error } = await supabase
        .from('streams')
        .select('id')
        .eq('stream_key', streamKey)
        .eq('is_active', true)
        .single();

      return !error && !!stream;
    } catch (error) {
      console.warn('Stream validation failed:', error);
      return false;
    }
  }
}
