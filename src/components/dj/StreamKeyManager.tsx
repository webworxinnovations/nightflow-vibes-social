
import { useState } from "react";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { ServerStatusPanel } from "./ServerStatusPanel";
import { StreamConfigurationPanel } from "./StreamConfigurationPanel";
import { TroubleshootingGuide } from "./TroubleshootingGuide";

export const StreamKeyManager = () => {
  const { 
    streamConfig, 
    streamStatus, 
    isLoading,
    generateStreamKey, 
    revokeStreamKey, 
    isLive, 
    viewerCount,
    duration,
    bitrate
  } = useRealTimeStream();
  
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);

  const handleServerStatusChange = (status: { available: boolean; url: string } | null) => {
    setServerStatus(status);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-green-400 font-medium">✅ HTTPS Streaming Server Ready!</p>
        </div>
        <div className="text-sm text-green-300 space-y-1">
          <p>• OBS RTMP: <code className="bg-black/20 px-2 py-1 rounded">rtmp://67.205.179.77:1935/live</code></p>
          <p>• Stream Playback: HTTPS (secure, no mixed content issues)</p>
          <p>• Generate your stream key below and copy it to OBS</p>
        </div>
      </div>

      <ServerStatusPanel onStatusChange={handleServerStatusChange} />
      
      <StreamConfigurationPanel
        streamConfig={streamConfig}
        isLive={isLive}
        viewerCount={viewerCount}
        duration={duration}
        bitrate={bitrate}
        isLoading={isLoading}
        serverAvailable={true}
        onGenerateKey={generateStreamKey}
        onRevokeKey={revokeStreamKey}
      />

      <TroubleshootingGuide serverAvailable={true} />
    </div>
  );
};
