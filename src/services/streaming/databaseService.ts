
import { supabase } from '@/integrations/supabase/client';
import { StreamConfig } from '@/types/streaming';
import { URLGenerator } from './core/urlGenerator';

export class DatabaseService {
  static async generateStreamKey(userId: string): Promise<StreamConfig> {
    const { data, error } = await supabase
      .rpc('generate_secure_stream_key', { user_id_param: userId });

    if (error || !data || data.length === 0) {
      throw new Error('Failed to generate secure stream key: ' + (error?.message || 'Unknown error'));
    }

    const result = data[0];
    return {
      streamKey: result.stream_key,
      rtmpUrl: result.rtmp_url,
      hlsUrl: result.hls_url,
      isLive: false,
      viewerCount: 0
    };
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
      .rpc('validate_stream_key_secure', { stream_key_param: streamKey });

    if (error || !data || data.length === 0) {
      return false;
    }

    return data[0].is_valid;
  }

  static async revokeStream(userId: string, streamKey?: string): Promise<void> {
    if (streamKey) {
      const { data, error } = await supabase
        .rpc('revoke_stream_credentials', { 
          stream_key_param: streamKey, 
          user_id_param: userId 
        });

      if (error) {
        throw new Error('Failed to revoke stream credentials: ' + error.message);
      }
    } else {
      // Fallback: deactivate all active streams for user
      const { error } = await supabase
        .from('streams')
        .update({ is_active: false, status: 'offline' })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        throw new Error('Failed to revoke stream');
      }
    }
  }
}
