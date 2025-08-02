
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyManager } from "./StreamKeyManager";
import { DigitalOceanDeploymentHelper } from "./DigitalOceanDeploymentHelper";
import { StreamingTestPanel } from "./StreamingTestPanel";
import { useStreamKey } from "@/hooks/useStreamKey";
import { Button } from "@/components/ui/button";
import { TestTube, Play } from "lucide-react";

export const LiveStreamManager = () => {
  const { streamKey } = useStreamKey();
  const [activeTab, setActiveTab] = useState("test");

  return (
    <div className="space-y-6">
      {/* Big prominent banner */}
      <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/30 rounded-xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TestTube className="h-8 w-8 text-green-400" />
          <h2 className="text-2xl font-bold text-green-400">Ready to Test OBS Streaming!</h2>
        </div>
        <p className="text-lg text-white mb-4">
          Test your OBS setup locally - no external servers needed!
        </p>
        <Button
          onClick={() => setActiveTab("test")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
        >
          <Play className="mr-2 h-5 w-5" />
          Start OBS Test Setup
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="test" 
            className="bg-green-500/30 data-[state=active]:bg-green-500 data-[state=active]:text-white text-green-300 font-bold"
          >
            🧪 OBS Test Setup (START HERE!)
          </TabsTrigger>
          <TabsTrigger value="obs">🎥 Advanced OBS</TabsTrigger>
          <TabsTrigger value="deployment">🔧 Server Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <StreamingTestPanel />
        </TabsContent>

        <TabsContent value="obs">
          <StreamKeyManager />
        </TabsContent>

        <TabsContent value="deployment">
          <DigitalOceanDeploymentHelper />
        </TabsContent>
      </Tabs>
    </div>
  );
};
