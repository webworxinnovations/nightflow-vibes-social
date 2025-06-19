
import { supabase } from '@/lib/supabase';
import type { StreamConfig } from '@/types/streaming';

export class StreamingDatabase {
  static async saveStream(config: StreamConfig, userId: string): Promise<void> {
    console.log('💾 Saving stream to database:', { streamKey: config.streamKey, userId });
    
    // First, deactivate any existing streams for this user
    const { error: deactivateError } = await supabase
      .from('streams')
      .update({
        is_active: false,
        status: 'offline',
        ended_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('⚠️ Failed to deactivate existing streams:', deactivateError);
    }

    // Then insert the new stream
    const { error } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        stream_key: config.streamKey,
        rtmp_url: config.rtmpUrl,
        hls_url: config.hlsUrl,
        status: 'offline',
        is_active: true,
        title: 'Live DJ Stream',
        description: 'Live DJ Performance'
      });

    if (error) {
      console.error('❌ Failed to save stream to database:', error);
      throw new Error('Failed to save stream configuration');
    }

    console.log('✅ Stream saved to database successfully');
  }

  static async getCurrentStream(userId: string): Promise<StreamConfig | null> {
    console.log('🔍 Getting current stream for user:', userId);
    
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Failed to get current stream:', error);
      return null;
    }

    if (!data) {
      console.log('📭 No active stream found');
      return null;
    }

    console.log('✅ Current stream found:', data.stream_key);
    return {
      rtmpUrl: data.rtmp_url,
      streamKey: data.stream_key,
      hlsUrl: data.hls_url,
      isLive: data.status === 'live',
      viewerCount: data.viewer_count || 0
    };
  }

  static async revokeStream(userId: string): Promise<void> {
    console.log('🗑️ Revoking stream for user:', userId);
    
    const { error } = await supabase
      .from('streams')
      .update({
        is_active: false,
        status: 'offline',
        ended_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Failed to revoke stream:', error);
      throw new Error('Failed to revoke stream');
    }

    console.log('✅ Stream revoked successfully');
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    console.log('🔑 Validating stream key in database:', streamKey);
    
    const { data, error } = await supabase
      .from('streams')
      .select('id')
      .eq('stream_key', streamKey)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('❌ Database validation error:', error);
      return false;
    }

    const isValid = !!data;
    console.log('✅ Database validation result:', isValid);
    return isValid;
  }

  static async updateStreamStatus(streamKey: string, status: 'live' | 'offline'): Promise<void> {
    console.log('📊 Updating stream status:', { streamKey, status });
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'live') {
      updateData.started_at = new Date().toISOString();
    } else {
      updateData.ended_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('streams')
      .update(updateData)
      .eq('stream_key', streamKey)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Failed to update stream status:', error);
    } else {
      console.log('✅ Stream status updated successfully');
    }
  }
}
