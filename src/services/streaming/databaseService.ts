
import { supabase } from '@/integrations/supabase/client';
import { StreamConfig } from '@/types/streaming';
import { StreamingConfig } from './config';

export class DatabaseService {
  static async saveStream(userId: string, streamKey: string, rtmpUrl: string, hlsUrl: string): Promise<void> {
    console.log('💾 Saving stream to database:', { streamKey, userId });

    const { error } = await supabase
      .from('streams')
      .insert({
        user_id: userId,
        stream_key: streamKey,
        rtmp_url: rtmpUrl,
        hls_url: hlsUrl,
        status: 'offline',
        is_active: true,
        title: 'Live DJ Stream',
        description: 'Live DJ Performance'
      });

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Stream saved to database successfully');
  }

  static async getCurrentStream(userId: string): Promise<StreamConfig | null> {
    console.log('🔍 Getting current stream for user:', userId);

    const { data: streams } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!streams || streams.length === 0) {
      console.log('No active stream found');
      return null;
    }

    const stream = streams[0];
    console.log('✅ Current stream found:', stream.stream_key);

    // Use the correct HLS URL from the streaming config
    const correctedHlsUrl = StreamingConfig.getHlsUrl(stream.stream_key);
    console.log('🔧 Using corrected HLS URL:', correctedHlsUrl);

    return {
      streamKey: stream.stream_key,
      rtmpUrl: stream.rtmp_url,
      hlsUrl: correctedHlsUrl,
      isLive: stream.status === 'live',
      viewerCount: stream.viewer_count || 0
    };
  }

  static async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      console.log('🔑 Validating stream key in database:', streamKey);
      
      const { data } = await supabase
        .from('streams')
        .select('id')
        .eq('stream_key', streamKey)
        .eq('is_active', true);

      const isValid = data && data.length > 0;
      console.log('✅ Database validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Stream key validation failed:', error);
      return false;
    }
  }

  static async revokeStream(userId: string): Promise<void> {
    console.log('🗑️ Revoking stream for user:', userId);

    // Mark all active streams as inactive
    await supabase
      .from('streams')
      .update({ 
        is_active: false,
        status: 'offline',
        ended_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    console.log('✅ Stream revoked successfully');
  }
}
