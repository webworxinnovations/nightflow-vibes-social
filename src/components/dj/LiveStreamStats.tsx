
interface LiveStreamStatsProps {
  viewerCount: number;
}

export const LiveStreamStats = ({ viewerCount }: LiveStreamStatsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="text-2xl font-bold text-red-500">● LIVE</div>
        <div className="text-sm text-muted-foreground">Broadcasting</div>
      </div>
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="text-2xl font-bold">{viewerCount}</div>
        <div className="text-sm text-muted-foreground">Watching Now</div>
      </div>
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="text-2xl font-bold">HD</div>
        <div className="text-sm text-muted-foreground">Stream Quality</div>
      </div>
    </div>
  );
};
