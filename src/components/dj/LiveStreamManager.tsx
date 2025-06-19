
import { useEffect } from "react";
import { LiveStreamTabs } from "./LiveStreamTabs";
import { StreamingSetupChecker } from "./StreamingSetupChecker";
import { useStreamKey } from "@/hooks/useStreamKey";
import { useOBSWebSocket } from "@/hooks/useOBSWebSocket";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
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
    <ErrorBoundary>
      <div className="space-y-6">
        <StreamingSetupChecker />
        <LiveStreamTabs isLive={isLive} viewerCount={viewerCount} />
      </div>
    </ErrorBoundary>
  );
};
