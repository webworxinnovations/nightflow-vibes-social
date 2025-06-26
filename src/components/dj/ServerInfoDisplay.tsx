
interface ServerInfoDisplayProps {
  className?: string;
}

export const ServerInfoDisplay = ({ className }: ServerInfoDisplayProps) => {
  return (
    <div className={`p-4 bg-green-500/10 border border-green-500/20 rounded-lg ${className}`}>
      <h4 className="font-medium text-green-400 mb-2">🎉 Deployment Confirmed Successful!</h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>🎯 <strong>OBS Server URL:</strong> rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live</p>
        <p>📺 <strong>Stream Key:</strong> Generate in the OBS Streaming tab</p>
        <p>🔴 <strong>Status:</strong> All streaming services operational</p>
        <p>🌐 <strong>Browser Streaming:</strong> Fully supported</p>
        <p>📱 <strong>HLS Playback:</strong> Available at /live/STREAM_KEY/index.m3u8</p>
      </div>
    </div>
  );
};
