
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface LiveStream {
  id: string;
  title: string;
  status: 'live' | 'offline' | 'starting' | 'ending';
  viewer_count: number;
  max_viewers: number;
  started_at: string;
  stream_key: string;
  hls_url: string;
  streamer: {
    id: string;
    username: string;
    avatar_url?: string;
    verified?: boolean;
    streaming_title?: string;
    streaming_description?: string;
  };
}

export const useLiveStreams = () => {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveStreams = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get active streams from database
      const { data: streams, error: streamsError } = await supabase
        .from('streams')
        .select(`
          id,
          stream_key,
          title,
          description,
          status,
          viewer_count,
          max_viewers,
          started_at,
          hls_url,
          user_id,
          profiles!streams_user_id_fkey (
            id,
            username,
            avatar_url,
            streaming_title,
            streaming_description
          )
        `)
        .eq('is_active', true)
        .eq('status', 'live')
        .order('started_at', { ascending: false });

      if (streamsError) {
        throw streamsError;
      }

      // Also check server for real-time status
      const liveStreamData: LiveStream[] = [];

      for (const stream of streams || []) {
        try {
          const response = await fetch(`https://nightflow-vibes-social-production.up.railway.app/api/stream/${stream.stream_key}/status`);
          const serverStatus = await response.json();
          
          // Only include streams that are actually live according to server
          if (serverStatus.isLive) {
            liveStreamData.push({
              id: stream.id,
              title: stream.title || 'Live Stream',
              status: stream.status as 'live' | 'offline' | 'starting' | 'ending',
              viewer_count: serverStatus.viewerCount || 0,
              max_viewers: stream.max_viewers || 0,
              started_at: stream.started_at,
              stream_key: stream.stream_key,
              hls_url: stream.hls_url,
              streamer: {
                id: stream.profiles.id,
                username: stream.profiles.username,
                avatar_url: stream.profiles.avatar_url,
                verified: false, // Add verification logic later
                streaming_title: stream.profiles.streaming_title,
                streaming_description: stream.profiles.streaming_description
              }
            });
          }
        } catch (error) {
          console.error(`Failed to check server status for stream ${stream.stream_key}:`, error);
          // Still include the stream but mark as potentially offline
          liveStreamData.push({
            id: stream.id,
            title: stream.title || 'Live Stream',
            status: stream.status as 'live' | 'offline' | 'starting' | 'ending',
            viewer_count: stream.viewer_count || 0,
            max_viewers: stream.max_viewers || 0,
            started_at: stream.started_at,
            stream_key: stream.stream_key,
            hls_url: stream.hls_url,
            streamer: {
              id: stream.profiles.id,
              username: stream.profiles.username,
              avatar_url: stream.profiles.avatar_url,
              verified: false,
              streaming_title: stream.profiles.streaming_title,
              streaming_description: stream.profiles.streaming_description
            }
          });
        }
      }

      setLiveStreams(liveStreamData);
    } catch (err) {
      console.error('Error fetching live streams:', err);
      setError('Failed to load live streams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStreams();

    // Set up real-time subscription for stream updates
    const channel = supabase
      .channel('live-streams')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams'
        },
        () => {
          console.log('Stream update detected, refetching...');
          fetchLiveStreams();
        }
      )
      .subscribe();

    // Refresh every 30 seconds to get updated viewer counts
    const interval = setInterval(fetchLiveStreams, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    liveStreams,
    isLoading,
    error,
    refetch: fetchLiveStreams
  };
};
