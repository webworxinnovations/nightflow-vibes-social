
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Radio, Play, Eye } from "lucide-react";
import type { LiveStream } from "@/hooks/useLiveStreams";

interface LiveStreamDiscoveryProps {
  onWatchStream: (stream: LiveStream) => void;
}

export const LiveStreamDiscovery = ({ onWatchStream }: LiveStreamDiscoveryProps) => {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      const { data, error } = await supabase
        .from('public_streams')
        .select('*')
        .order('viewer_count', { ascending: false });

      if (error) {
        return;
      } 

      const liveStreamData: LiveStream[] = (data || []).map(stream => ({
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
      setIsLoading(false);
    };

    fetchLiveStreams();

    // Subscribe to stream status changes
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (liveStreams.length === 0) {
    return (
      <div className="text-center py-12">
        <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Live Streams</h3>
        <p className="text-muted-foreground">
          No DJs are currently streaming. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {liveStreams.map((stream) => (
        <Card key={stream.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={stream.streamer.avatar_url || undefined}
                    alt={stream.streamer.username}
                  />
                  <AvatarFallback>
                    {stream.streamer.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm">{stream.streamer.username}</CardTitle>
                </div>
              </div>
              <Badge variant="destructive" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Stream Preview Placeholder */}
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <Play className="h-12 w-12 text-white/70" />
            </div>
            
            <div>
              <h3 className="font-semibold truncate">
                {stream.title || "Live Stream"}
              </h3>
              {stream.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {stream.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stream.viewer_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {stream.max_viewers || 0} peak
                </span>
              </div>
              
              <Button 
                size="sm"
                onClick={() => onWatchStream(stream)}
                className="flex items-center gap-1"
              >
                <Play className="h-4 w-4" />
                Watch
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
