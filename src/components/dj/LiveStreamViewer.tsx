
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Timer,
  Settings,
  Share,
  Monitor
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { RealVideoPlayer } from "./RealVideoPlayer";

export const LiveStreamViewer = () => {
  const { 
    streamConfig, 
    streamStatus, 
    isLive, 
    viewerCount, 
    duration,
    bitrate,
    resolution 
  } = useRealTimeStream();
  
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shareStream = () => {
    if (streamConfig?.hlsUrl) {
      navigator.clipboard.writeText(streamConfig.hlsUrl);
      alert(`Stream URL copied! Share this link:\n${streamConfig.hlsUrl}`);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        {/* Stream Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Live Stream
          </h3>
          
          {isLive && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {viewerCount}
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(duration)}
              </div>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {streamConfig?.hlsUrl ? (
            <RealVideoPlayer
              hlsUrl={streamConfig.hlsUrl}
              isLive={isLive}
              onFullscreen={handleFullscreen}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-medium mb-2">No Stream Key</h4>
                <p className="text-sm">
                  Generate a stream key in the Setup tab to get started
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stream Stats */}
        {isLive && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{viewerCount}</div>
              <div className="text-xs text-muted-foreground">Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{formatTime(duration)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{(bitrate / 1000).toFixed(1)}k</div>
              <div className="text-xs text-muted-foreground">Bitrate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{resolution || 'HD'}</div>
              <div className="text-xs text-muted-foreground">Quality</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={shareStream}
            variant="outline"
            size="sm"
            disabled={!streamConfig?.hlsUrl}
            className="flex-1"
          >
            <Share className="mr-2 h-4 w-4" />
            Share Stream
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isLive}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
