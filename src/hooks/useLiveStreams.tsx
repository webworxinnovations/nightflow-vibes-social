
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface LiveStream {
  id: string;
  user_id: string;
  stream_key: string;
  hls_url: string;
  title: string | null;
  description: string | null;
  status: 'offline' | 'live' | 'starting' | 'ending';
  viewer_count: number;
  started_at: string | null;
  streamer: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    verified: boolean;
    streaming_title: string | null;
    streaming_description: string | null;
  };
}

export const useLiveStreams = () => {
  const queryClient = useQueryClient();

  const { data: liveStreams = [], isLoading, error } = useQuery({
    queryKey: ['live-streams'],
    queryFn: async (): Promise<LiveStream[]> => {
      const { data, error } = await supabase
        .from('streams')
        .select(`
          *,
          streamer:profiles!user_id(
            id,
            username,
            full_name,
            avatar_url,
            verified,
            streaming_title,
            streaming_description
          )
        `)
        .eq('status', 'live')
        .eq('is_active', true)
        .order('viewer_count', { ascending: false });

      if (error) throw error;
      return data as LiveStream[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Subscribe to real-time stream status changes
  useEffect(() => {
    const channel = supabase
      .channel('live-streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
          filter: 'status=eq.live'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-streams'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    liveStreams,
    isLoading,
    error
  };
};
