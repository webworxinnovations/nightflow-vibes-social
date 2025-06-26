
interface ServerInfoDisplayProps {
  className?: string;
}

export const ServerInfoDisplay = ({ className }: ServerInfoDisplayProps) => {
  return (
    <div className={`p-4 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
      <h4 className="font-medium text-red-400 mb-2">⚠️ RTMP Connection Issue Detected</h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>❌ <strong>OBS Connection:</strong> Failed - "Hostname not found"</p>
        <p>❌ <strong>RTMP Server:</strong> Not accessible at nightflow-app-wijb2.ondigitalocean.app:1935</p>
        <p>⚠️ <strong>Issue:</strong> DigitalOcean may not support custom RTMP ports</p>
        <p>💡 <strong>Solution:</strong> Use Browser Streaming method instead</p>
        <p>🔄 <strong>Alternative:</strong> Deploy to VPS with full port control</p>
      </div>
    </div>
  );
};
