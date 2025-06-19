
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
      <ServerStatusPanel onStatusChange={handleServerStatusChange} />
      
      <StreamConfigurationPanel
        streamConfig={streamConfig}
        isLive={isLive}
        viewerCount={viewerCount}
        duration={duration}
        bitrate={bitrate}
        isLoading={isLoading}
        serverAvailable={serverStatus?.available ?? false}
        onGenerateKey={generateStreamKey}
        onRevokeKey={revokeStreamKey}
      />

      <TroubleshootingGuide serverAvailable={serverStatus?.available ?? false} />
    </div>
  );
};
