
import { supabase } from '@/lib/supabase';
import type { StreamConfig } from '@/types/streaming';

export class StreamingDatabase {
  static async saveStream(config: StreamConfig, userId: string): Promise<void> {
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
      throw new Error('Failed to deactivate existing streams');
    }

    // Insert the new stream (without sensitive credentials)
    const { data: streamData, error: streamError } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        status: 'offline',
        is_active: true,
        title: 'Live DJ Stream',
        description: 'Live DJ Performance'
      })
      .select('id')
      .single();

    if (streamError || !streamData) {
      throw new Error('Failed to save stream configuration');
    }

    // Store credentials separately in secure table
    const { error: credentialsError } = await supabase
      .from('stream_credentials')
      .insert({
        stream_id: streamData.id,
        stream_key: config.streamKey,
        rtmp_url: config.rtmpUrl,
        hls_url: config.hlsUrl
      });

    if (credentialsError) {
      // Clean up the stream record if credentials insertion fails
      await supabase.from('streams').delete().eq('id', streamData.id);
      throw new Error('Failed to save stream credentials');
    }
  }

  static async getCurrentStream(userId: string): Promise<StreamConfig | null> {
    const { data: streamData, error: streamError } = await supabase
      .from('streams')
      .select('id, status, viewer_count, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (streamError || !streamData) {
      return null;
    }

    // Get credentials using the secure function
    const { data: credentials, error: credentialsError } = await supabase
      .rpc('get_stream_credentials', { stream_id_param: streamData.id });

    if (credentialsError || !credentials || credentials.length === 0) {
      return null;
    }

    const cred = credentials[0];
    return {
      streamKey: cred.stream_key,
      rtmpUrl: cred.rtmp_url,
      hlsUrl: cred.hls_url,
      isLive: streamData.status === 'live',
      viewerCount: streamData.viewer_count || 0
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
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error('Failed to revoke stream');
    }
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('stream_credentials')
      .select('stream_id')
      .eq('stream_key', streamKey)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Check if the stream is still active
    const { data: streamData, error: streamError } = await supabase
      .from('streams')
      .select('is_active')
      .eq('id', data.stream_id)
      .eq('is_active', true)
      .maybeSingle();

    return !streamError && !!streamData;
  }

  static async updateStreamStatus(streamKey: string, status: 'live' | 'offline'): Promise<void> {
    // First get the stream ID from credentials
    const { data: credData, error: credError } = await supabase
      .from('stream_credentials')
      .select('stream_id')
      .eq('stream_key', streamKey)
      .maybeSingle();

    if (credError || !credData) {
      throw new Error('Stream not found');
    }

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
      .eq('id', credData.stream_id)
      .eq('is_active', true);

    if (error) {
      throw new Error('Failed to update stream status');
    }
  }
}
