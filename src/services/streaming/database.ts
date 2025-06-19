
import { supabase } from '@/integrations/supabase/client';
import type { StreamConfig } from '@/types/streaming';

export class StreamingDatabase {
  static async saveStream(config: StreamConfig, userId: string): Promise<void> {
    const { error } = await supabase
      .from('streams')
      .upsert({
        user_id: userId,
        stream_key: config.streamKey,
        rtmp_url: config.rtmpUrl,
        hls_url: config.hlsUrl,
        status: 'offline',
        is_active: true,
        title: 'Live Stream',
        description: 'DJ Live Stream'
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Failed to save stream to database:', error);
      throw new Error('Failed to save stream configuration');
    }
  }

  static async getCurrentStream(userId: string): Promise<StreamConfig | null> {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No stream found
        return null;
      }
      console.error('Failed to get current stream:', error);
      return null;
    }

    return {
      rtmpUrl: data.rtmp_url,
      streamKey: data.stream_key,
      hlsUrl: data.hls_url,
      isLive: data.status === 'live',
      viewerCount: data.viewer_count || 0
    };
  }

  static async revokeStream(userId: string): Promise<void> {
    const { error } = await supabase
      .from('streams')
      .update({
        is_active: false,
        status: 'offline',
        ended_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to revoke stream:', error);
      throw new Error('Failed to revoke stream');
    }
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('streams')
      .select('id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }
}
