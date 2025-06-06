
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamKeyManager } from "./StreamKeyManager";
import { LiveStreamViewer } from "./LiveStreamViewer";
import { useStreamKey } from "@/hooks/useStreamKey";
import { useOBSWebSocket } from "@/hooks/useOBSWebSocket";
import { toast } from "sonner";

export const LiveStreamManager = () => {
  const { isLive, viewerCount, streamData } = useStreamKey();
  const { isConnected: obsConnected } = useOBSWebSocket();

  // Show connection status
  useEffect(() => {
    if (isLive && !obsConnected) {
      toast.info("💡 Tip: Connect OBS for advanced scene management while streaming");
    }
  }, [isLive, obsConnected]);

  return (
    <div className="space-y-6">
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
          
          {isLive && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-2xl font-bold text-red-500">● LIVE</div>
                <div className="text-sm text-muted-foreground">Broadcasting</div>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold">{viewerCount}</div>
                <div className="text-sm text-muted-foreground">Watching Now</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-2xl font-bold">HD</div>
                <div className="text-sm text-muted-foreground">Stream Quality</div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <StreamKeyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
