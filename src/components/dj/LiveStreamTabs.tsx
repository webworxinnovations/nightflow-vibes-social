
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamConfigurationPanel } from "./StreamConfigurationPanel";
import { BrowserStreamingPanel } from "./BrowserStreamingPanel";
import { LiveStreamViewer } from "./LiveStreamViewer";
import { ServerStatusPanel } from "./ServerStatusPanel";
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
    <Tabs defaultValue="browser" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="browser">🌐 Browser Stream</TabsTrigger>
        <TabsTrigger value="obs">📹 OBS Setup</TabsTrigger>
        <TabsTrigger value="viewer">👀 Stream View</TabsTrigger>
        <TabsTrigger value="server">🖥️ Server Status</TabsTrigger>
      </TabsList>

      <TabsContent value="browser" className="mt-6">
        {streamConfig ? (
          <BrowserStreamingPanel 
            streamKey={streamConfig.streamKey}
            onStreamStart={() => console.log('Browser stream started')}
            onStreamStop={() => console.log('Browser stream stopped')}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Generate a stream key to start browser streaming</p>
            <button 
              onClick={generateStreamKey}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Stream Key'}
            </button>
          </div>
        )}
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
