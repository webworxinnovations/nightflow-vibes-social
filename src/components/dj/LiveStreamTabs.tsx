
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyManager } from "./StreamKeyManager";
import { LiveStreamViewer } from "./LiveStreamViewer";
import { StreamingMethodSelector } from "./StreamingMethodSelector";
import { LiveStreamStats } from "./LiveStreamStats";
import { OBSIntegration } from "./OBSIntegration";
import { useStreamKey } from "@/hooks/useStreamKey";
import { useState } from "react";

interface LiveStreamTabsProps {
  isLive: boolean;
  viewerCount: number;
}

export const LiveStreamTabs = ({ isLive, viewerCount }: LiveStreamTabsProps) => {
  const { streamKey } = useStreamKey();
  const [streamStatus, setStreamStatus] = useState(isLive);

  const handleStreamStatusChange = (newStatus: boolean) => {
    setStreamStatus(newStatus);
  };

  return (
    <Tabs defaultValue="setup" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="setup">Stream Setup</TabsTrigger>
        <TabsTrigger value="methods">Streaming Methods</TabsTrigger>
        <TabsTrigger value="preview">Live Preview</TabsTrigger>
        <TabsTrigger value="stats">Analytics</TabsTrigger>
        <TabsTrigger value="obs">OBS Control</TabsTrigger>
      </TabsList>

      <TabsContent value="setup" className="space-y-6">
        <StreamKeyManager />
      </TabsContent>

      <TabsContent value="methods" className="space-y-6">
        {streamKey ? (
          <StreamingMethodSelector 
            streamKey={streamKey}
            onStreamStatusChange={handleStreamStatusChange}
          />
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <p>Generate a stream key first to access streaming methods.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="preview" className="space-y-6">
        <LiveStreamViewer />
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        <LiveStreamStats 
          isLive={streamStatus || isLive} 
          viewerCount={viewerCount} 
          streamKey={streamKey || ''} 
        />
      </TabsContent>

      <TabsContent value="obs" className="space-y-6">
        <OBSIntegration />
      </TabsContent>
    </Tabs>
  );
};
