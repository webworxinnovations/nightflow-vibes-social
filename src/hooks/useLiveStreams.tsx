
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface LiveStream {
  id: string;
  title: string;
  status: 'live' | 'offline' | 'starting' | 'ending';
  viewer_count: number;
  max_viewers: number;
  started_at: string;
  duration: number;
  description?: string;
  resolution?: string;
  streamer: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
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

      // Get active live streams from the secure public view
      const { data: streams, error: streamsError } = await supabase
        .from('public_streams')
        .select('*')
        .order('started_at', { ascending: false });

      if (streamsError) {
        throw streamsError;
      }

      const liveStreamData: LiveStream[] = (streams || []).map(stream => ({
        id: stream.id!,
        title: stream.title || 'Live Stream',
        status: stream.status as 'live' | 'offline' | 'starting' | 'ending',
        viewer_count: stream.viewer_count || 0,
        max_viewers: stream.max_viewers || 0,
        started_at: stream.started_at || '',
        duration: stream.duration || 0,
        description: stream.description || '',
        resolution: stream.resolution || '',
        streamer: {
          id: stream.user_id!,
          username: stream.username || 'Anonymous',
          avatar_url: stream.avatar_url || undefined,
          full_name: stream.full_name || undefined
        }
      }));

      setLiveStreams(liveStreamData);
    } catch (err) {
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
