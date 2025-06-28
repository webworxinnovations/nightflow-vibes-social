
import { Key } from "lucide-react";

interface StreamHeaderProps {
  isLive: boolean;
  viewerCount: number;
  streamDuration: number;
  formatDuration: (seconds: number) => string;
}

export const StreamHeader = ({ 
  isLive, 
  viewerCount, 
  streamDuration, 
  formatDuration 
}: StreamHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Key className="h-5 w-5" />
        DigitalOcean Droplet Stream Configuration
      </h3>
      {isLive && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 font-medium">LIVE</span>
          <span className="text-muted-foreground">
            {viewerCount} viewers • {formatDuration(streamDuration)}
          </span>
        </div>
      )}
    </div>
  );
};
