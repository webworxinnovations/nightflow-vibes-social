
import { Network } from "lucide-react";

interface ConnectionDetailsSectionProps {
  obsServerUrl: string;
  fullRtmpUrl: string;
  streamKey: string;
  serverUrl: string;
}

export const ConnectionDetailsSection = ({ 
  obsServerUrl, 
  fullRtmpUrl, 
  streamKey, 
  serverUrl 
}: ConnectionDetailsSectionProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Network className="h-4 w-4" />
        Connection Details
      </h4>
      <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded">
        <p><strong>OBS Server URL:</strong> {obsServerUrl}</p>
        <p><strong>Full RTMP URL:</strong> {fullRtmpUrl}</p>
        <p><strong>Stream Key:</strong> {streamKey.substring(0, 8)}...{streamKey.slice(-4)}</p>
        <p><strong>Server:</strong> {serverUrl}</p>
      </div>
    </div>
  );
};
