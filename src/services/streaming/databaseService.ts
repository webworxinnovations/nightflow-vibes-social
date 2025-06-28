
import { supabase } from '@/integrations/supabase/client';
import { StreamConfig } from '@/types/streaming';
import { URLGenerator } from './core/urlGenerator';

export class DatabaseService {
  static async saveStream(userId: string, streamKey: string, rtmpUrl: string, hlsUrl: string): Promise<void> {
    // First, deactivate any existing streams for this user
    await supabase
      .from('streams')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Create new stream record
    const { error } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        stream_key: streamKey,
        rtmp_url: rtmpUrl,
        hls_url: hlsUrl,
        title: 'Live DJ Stream',
        description: 'Live DJ Performance',
        status: 'offline',
        is_active: true
      });

    if (error) {
      console.error('Failed to save stream to database:', error);
      throw new Error('Failed to save stream configuration');
    }

    console.log('✅ Stream configuration saved to database');
  }

  static async getCurrentStream(userId: string): Promise<StreamConfig | null> {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log('No active stream found:', error);
      return null;
    }

    if (!data) return null;

    return {
      streamKey: data.stream_key,
      rtmpUrl: data.rtmp_url,
      hlsUrl: data.hls_url,
      isLive: data.status === 'live',
      viewerCount: data.viewer_count || 0
    };
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('streams')
      .select('id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .single();

    if (error) {
      console.log('Stream key validation failed:', error);
      return false;
    }

    return !!data;
  }

  static async revokeStream(userId: string): Promise<void> {
    const { error } = await supabase
      .from('streams')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to revoke stream:', error);
      throw new Error('Failed to revoke stream');
    }

    console.log('✅ Stream revoked successfully');
  }
}
