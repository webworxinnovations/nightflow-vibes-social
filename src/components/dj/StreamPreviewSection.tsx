
import { useStreamKey } from "@/hooks/useStreamKey";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Badge } from "@/components/ui/badge";
import { Users, Timer, Activity, Eye } from "lucide-react";
import { useState, useEffect } from "react";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();
  const [streamDuration, setStreamDuration] = useState(0);

  useEffect(() => {
    if (!isLive) {
      setStreamDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setStreamDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!streamData?.streamUrl) {
    return (
      <GlassmorphicCard>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📺</div>
          <h3 className="text-lg font-semibold mb-2">No Active Stream</h3>
          <p className="text-muted-foreground">
            Your stream preview will appear here when you start broadcasting from OBS.
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        {/* Stream Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Live Stream</h3>
          </div>
          
          <div className="flex items-center gap-4">
            {isLive ? (
              <Badge variant="destructive" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary">PREPARING...</Badge>
            )}
            
            {streamData.streamUrl && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {viewerCount}
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {formatDuration(streamDuration)}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Broadcasting
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Player Preview */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <RealVideoPlayer
            hlsUrl={streamData.streamUrl}
            isLive={isLive}
            autoplay={false}
            muted={true}
            className="w-full h-full"
          />
          
          {/* Preview Label Overlay */}
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            DJ Preview
          </div>
        </div>

        {/* Stream Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">
              {isLive ? '🔴 LIVE' : '⏳ Starting...'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Viewers</div>
            <div className="font-medium">{viewerCount}</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Duration</div>
            <div className="font-medium">{formatDuration(streamDuration)}</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Quality</div>
            <div className="font-medium">
              {isLive ? 'HD' : 'N/A'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            {isLive 
              ? "🎉 You're live! This is how your stream appears to viewers. Keep creating amazing content!"
              : "📡 Stream detected from OBS! Your preview will appear shortly as the stream initializes."
            }
          </p>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
