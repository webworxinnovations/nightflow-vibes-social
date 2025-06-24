
import { Users, Timer, Activity } from "lucide-react";

interface LiveStreamStatsHeaderProps {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
}

export const LiveStreamStatsHeader = ({ 
  isLive, 
  viewerCount, 
  duration, 
  bitrate 
}: LiveStreamStatsHeaderProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLive) return null;

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1 text-red-500">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        LIVE
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users className="h-4 w-4" />
        {viewerCount} viewers
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Timer className="h-4 w-4" />
        {formatTime(duration)}
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Activity className="h-4 w-4" />
        {(bitrate / 1000).toFixed(1)}k
      </div>
    </div>
  );
};
