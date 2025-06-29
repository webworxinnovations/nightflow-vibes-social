
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyManager } from "./StreamKeyManager";
import { BrowserStreamingPanel } from "./BrowserStreamingPanel";
import { DigitalOceanDeploymentHelper } from "./DigitalOceanDeploymentHelper";
import { StreamingTestPanel } from "./StreamingTestPanel";
import { useStreamKey } from "@/hooks/useStreamKey";

export const LiveStreamManager = () => {
  const { streamKey } = useStreamKey();
  const [activeTab, setActiveTab] = useState("test");

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="text-green-400 font-medium">🎯 Ready to Test OBS Streaming!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use the "Test Setup" tab below to configure OBS with local streaming - no external servers needed!
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test" className="bg-green-500/20 data-[state=active]:bg-green-500">
            🧪 Test Setup (Start Here!)
          </TabsTrigger>
          <TabsTrigger value="obs">🎥 OBS Streaming</TabsTrigger>
          <TabsTrigger value="browser">🌐 Browser Stream</TabsTrigger>
          <TabsTrigger value="deployment">🔧 Advanced Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <StreamingTestPanel />
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

        <TabsContent value="deployment">
          <DigitalOceanDeploymentHelper />
        </TabsContent>
      </Tabs>
    </div>
  );
};
