
interface ServerInfoDisplayProps {
  className?: string;
}

export const ServerInfoDisplay = ({ className }: ServerInfoDisplayProps) => {
  return (
    <div className={`p-4 bg-green-500/10 border border-green-500/20 rounded-lg ${className}`}>
      <h4 className="font-medium text-green-400 mb-2">✅ DigitalOcean Droplet Ready</h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>✅ <strong>OBS Connection:</strong> Ready at rtmp://67.205.179.77:1935/live</p>
        <p>✅ <strong>RTMP Server:</strong> Running on port 1935</p>
        <p>✅ <strong>HTTP API:</strong> Available on port 3001</p>
        <p>💡 <strong>Status:</strong> Your droplet is online and ready for streaming</p>
        <p>🎯 <strong>Next Step:</strong> Configure OBS with your stream key</p>
      </div>
    </div>
  );
};
