
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamConfigurationPanel } from "./StreamConfigurationPanel";
import { LiveStreamViewer } from "./LiveStreamViewer";
import { ServerStatusPanel } from "./ServerStatusPanel";
import { StreamPreviewSection } from "./StreamPreviewSection";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { useState } from "react";

export const LiveStreamTabs = ({ isLive, viewerCount }: { isLive: boolean; viewerCount: number }) => {
  const { 
    streamConfig, 
    streamStatus, 
    isLoading, 
    generateStreamKey, 
    revokeStreamKey 
  } = useRealTimeStream();
  
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);

  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="preview">📺 Live Preview</TabsTrigger>
        <TabsTrigger value="obs">📹 OBS Setup</TabsTrigger>
        <TabsTrigger value="viewer">👀 Viewer Mode</TabsTrigger>
        <TabsTrigger value="server">🖥️ Server Status</TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-6">
        <StreamPreviewSection />
      </TabsContent>


      <TabsContent value="obs" className="mt-6">
        <StreamConfigurationPanel
          streamConfig={streamConfig}
          isLive={streamStatus.isLive}
          viewerCount={streamStatus.viewerCount}
          duration={streamStatus.duration}
          bitrate={streamStatus.bitrate}
          isLoading={isLoading}
          serverAvailable={serverStatus?.available ?? false}
          onGenerateKey={generateStreamKey}
          onRevokeKey={revokeStreamKey}
        />
      </TabsContent>

      <TabsContent value="viewer" className="mt-6">
        <LiveStreamViewer />
      </TabsContent>

      <TabsContent value="server" className="mt-6">
        <ServerStatusPanel onStatusChange={setServerStatus} />
      </TabsContent>
    </Tabs>
  );
};
