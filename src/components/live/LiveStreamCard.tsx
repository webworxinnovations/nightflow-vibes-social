
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Play, Verified } from "lucide-react";
import type { LiveStream } from "@/hooks/useLiveStreams";

interface LiveStreamCardProps {
  stream: LiveStream;
  onWatch: (stream: LiveStream) => void;
}

export const LiveStreamCard = ({ stream, onWatch }: LiveStreamCardProps) => {
  const formatViewerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const streamDuration = stream.started_at
    ? Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 60000)
    : 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={stream.streamer.avatar_url || undefined} 
              alt={stream.streamer.username} 
            />
            <AvatarFallback>
              {stream.streamer.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm truncate">
                {stream.streamer.username}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {stream.title || "Live Stream"}
            </p>
          </div>

          <Badge variant="destructive" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="aspect-video bg-black rounded-md mb-3 relative overflow-hidden group-hover:scale-105 transition-transform">
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-12 w-12 text-white/80" />
          </div>
          {stream.description && (
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs bg-black/50 rounded px-2 py-1 truncate">
                {stream.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {formatViewerCount(stream.viewer_count)}
            </span>
            {streamDuration > 0 && (
              <span>{streamDuration}m</span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={() => onWatch(stream)}
            className="bg-primary hover:bg-primary/90"
          >
            Watch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
