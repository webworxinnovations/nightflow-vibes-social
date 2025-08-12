
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

    // Create new stream record (without sensitive credentials)
    const { data: streamData, error: streamError } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        title: 'Live DJ Stream',
        description: 'Live DJ Performance',
        status: 'offline',
        is_active: true
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
        stream_key: streamKey,
        rtmp_url: rtmpUrl,
        hls_url: hlsUrl
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
      .single();

    if (streamError) {
      return null;
    }

    if (!streamData) {
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

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('stream_credentials')
      .select('stream_id')
      .eq('stream_key', streamKey)
      .single();

    if (error) {
      return false;
    }

    // Check if the stream is still active
    const { data: streamData, error: streamError } = await supabase
      .from('streams')
      .select('is_active')
      .eq('id', data.stream_id)
      .eq('is_active', true)
      .single();

    return !streamError && !!streamData;
  }

  static async revokeStream(userId: string): Promise<void> {
    const { error } = await supabase
      .from('streams')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error('Failed to revoke stream');
    }
  }
}
