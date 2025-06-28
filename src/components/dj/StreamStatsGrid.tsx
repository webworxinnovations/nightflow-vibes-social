
interface StreamStatsGridProps {
  isLive: boolean;
  viewerCount: number;
  streamDuration: number;
  formatDuration: (seconds: number) => string;
}

export const StreamStatsGrid = ({ 
  isLive, 
  viewerCount, 
  streamDuration, 
  formatDuration 
}: StreamStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <div className="text-muted-foreground">Status</div>
        <div className="font-medium">
          {isLive ? '🔴 LIVE' : '🔄 Connecting...'}
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
          {isLive ? 'HD' : 'Connecting...'}
        </div>
      </div>
    </div>
  );
};
