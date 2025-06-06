
import { useStreamKey } from "@/hooks/useStreamKey";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Users, 
  Timer,
  Volume2,
  Maximize,
  Settings,
  Share
} from "lucide-react";
import { useState, useEffect } from "react";

export const LiveStreamViewer = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();
  const [streamDuration, setStreamDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);
    } else {
      setStreamDuration(0);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shareStream = () => {
    if (streamData.streamUrl) {
      navigator.clipboard.writeText(streamData.streamUrl);
      // In a real app, this would open a share dialog
      alert(`Stream URL copied! Share this link:\n${streamData.streamUrl}`);
    }
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        {/* Stream Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Stream</h3>
          
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
                {formatTime(streamDuration)}
              </div>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {isLive && streamData.streamUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              {/* This would be replaced with actual video player in production */}
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Play className="h-8 w-8 fill-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Live Stream Active</h4>
                <p className="text-gray-300">Broadcasting from OBS Studio</p>
                <p className="text-sm text-gray-400 mt-2">
                  In production, this would show your actual OBS stream
                </p>
              </div>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Volume2 className="h-4 w-4" />
                  <div className="w-20 h-1 bg-white/30 rounded">
                    <div className="w-3/4 h-full bg-white rounded"></div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    variant="secondary"
                    size="sm"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={shareStream}
                    variant="secondary"
                    size="sm"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-medium mb-2">Stream Offline</h4>
                <p className="text-sm">
                  {streamData.streamKey 
                    ? "Start streaming from OBS to go live" 
                    : "Generate a stream key to get started"
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stream Stats */}
        {isLive && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{viewerCount}</div>
              <div className="text-xs text-muted-foreground">Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{formatTime(streamDuration)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">HD</div>
              <div className="text-xs text-muted-foreground">Quality</div>
            </div>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
