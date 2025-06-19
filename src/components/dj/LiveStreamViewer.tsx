
import { useStreamKey } from "@/hooks/useStreamKey";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Badge } from "@/components/ui/badge";
import { Users, Timer, Activity } from "lucide-react";

export const LiveStreamViewer = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();

  const formatTime = (seconds: number) => {
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-lg font-semibold mb-2">No Stream Available</h3>
          <p className="text-muted-foreground">
            Generate a stream key and start streaming from OBS to see your live preview here.
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
          <h3 className="text-lg font-semibold">Live Stream Preview</h3>
          
          <div className="flex items-center gap-4">
            {isLive ? (
              <Badge variant="destructive" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary">OFFLINE</Badge>
            )}
            
            {isLive && (
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {viewerCount}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {isLive ? 'Broadcasting' : 'Standby'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <RealVideoPlayer
            hlsUrl={streamData.streamUrl}
            isLive={isLive}
            autoplay={false}
            muted={true}
          />
        </div>

        {/* Stream Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">
              {isLive ? '🔴 Broadcasting' : '⚫ Offline'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Viewers</div>
            <div className="font-medium">{viewerCount}</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground">Quality</div>
            <div className="font-medium">
              {isLive ? 'HD' : 'N/A'}
            </div>
          </div>
        </div>

        {!isLive && (
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 Start streaming from OBS to see your live feed here. Your stream will automatically appear when OBS connects.
            </p>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
