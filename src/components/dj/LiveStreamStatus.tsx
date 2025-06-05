
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  Timer,
  Users,
  Volume2,
  Zap
} from "lucide-react";

interface LiveStreamStatusProps {
  isLive: boolean;
  viewers: number;
  streamDuration: number;
  beatDetected: boolean;
  nextBeatDrop: number | null;
  onToggleLiveStream: () => void;
  onManualBeatDrop: () => void;
}

export const LiveStreamStatus = ({
  isLive,
  viewers,
  streamDuration,
  beatDetected,
  nextBeatDrop,
  onToggleLiveStream,
  onManualBeatDrop
}: LiveStreamStatusProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isLive ? 'text-red-500' : 'text-muted-foreground'}`}>
            {isLive ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            <span className="text-lg font-semibold">
              {isLive ? 'LIVE' : 'Offline'}
            </span>
          </div>
          {isLive && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {viewers} viewers
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {formatTime(streamDuration)}
              </div>
              {beatDetected && (
                <div className="flex items-center gap-1 text-orange-500 animate-pulse">
                  <Volume2 className="h-4 w-4" />
                  Beat Detected
                  {nextBeatDrop && ` (${nextBeatDrop}s)`}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {isLive && (
            <Button 
              onClick={onManualBeatDrop}
              variant="outline"
              size="lg"
              className="bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500/20"
            >
              <Zap className="mr-2 h-4 w-4" />
              Manual Beat Drop
            </Button>
          )}
          <Button 
            onClick={onToggleLiveStream}
            variant={isLive ? "destructive" : "default"}
            size="lg"
          >
            {isLive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                End Stream
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Go Live
              </>
            )}
          </Button>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
