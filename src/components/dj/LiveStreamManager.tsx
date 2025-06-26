
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyManager } from "./StreamKeyManager";
import { BrowserStreamingPanel } from "./BrowserStreamingPanel";
import { DigitalOceanDeploymentHelper } from "./DigitalOceanDeploymentHelper";
import { useStreamKey } from "@/hooks/useStreamKey";

export const LiveStreamManager = () => {
  const { streamKey } = useStreamKey();
  const [activeTab, setActiveTab] = useState("deployment");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deployment">🔧 Server Setup</TabsTrigger>
          <TabsTrigger value="obs">🎥 OBS Streaming</TabsTrigger>
          <TabsTrigger value="browser">🌐 Browser Stream</TabsTrigger>
        </TabsList>

        <TabsContent value="deployment">
          <DigitalOceanDeploymentHelper />
        </TabsContent>

        <TabsContent value="obs">
          <StreamKeyManager />
        </TabsContent>

        <TabsContent value="browser">
          <BrowserStreamingPanel 
            streamKey={streamKey || ''} 
            onStreamStart={() => console.log('Browser stream started')}
            onStreamStop={() => console.log('Browser stream stopped')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
