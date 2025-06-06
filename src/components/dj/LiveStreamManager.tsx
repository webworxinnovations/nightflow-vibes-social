
import { useEffect } from "react";
import { LiveStreamTabs } from "./LiveStreamTabs";
import { useStreamKey } from "@/hooks/useStreamKey";
import { useOBSWebSocket } from "@/hooks/useOBSWebSocket";
import { toast } from "sonner";

export const LiveStreamManager = () => {
  const { isLive, viewerCount } = useStreamKey();
  const { isConnected: obsConnected } = useOBSWebSocket();

  // Show connection status
  useEffect(() => {
    if (isLive && !obsConnected) {
      toast.info("💡 Tip: Connect OBS for advanced scene management while streaming");
    }
  }, [isLive, obsConnected]);

  return (
    <div className="space-y-6">
      <LiveStreamTabs isLive={isLive} viewerCount={viewerCount} />
    </div>
  );
};
