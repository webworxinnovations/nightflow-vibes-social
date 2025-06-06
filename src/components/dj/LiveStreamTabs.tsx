
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyManager } from "./StreamKeyManager";
import { LiveStreamViewer } from "./LiveStreamViewer";
import { LiveStreamStats } from "./LiveStreamStats";

interface LiveStreamTabsProps {
  isLive: boolean;
  viewerCount: number;
}

export const LiveStreamTabs = ({ isLive, viewerCount }: LiveStreamTabsProps) => {
  return (
    <Tabs defaultValue="stream" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stream" className="relative">
          Live Stream
          {isLive && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </TabsTrigger>
        <TabsTrigger value="setup">
          Stream Setup
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="stream" className="space-y-6">
        <LiveStreamViewer />
        {isLive && <LiveStreamStats viewerCount={viewerCount} />}
      </TabsContent>

      <TabsContent value="setup" className="space-y-6">
        <StreamKeyManager />
      </TabsContent>
    </Tabs>
  );
};
