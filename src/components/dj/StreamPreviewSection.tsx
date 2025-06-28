
import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { useServerTest } from "@/hooks/useServerTest";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamDiagnostics } from "./StreamDiagnostics";
import { StreamStatusHeader } from "./StreamStatusHeader";
import { ServerTestResults } from "./ServerTestResults";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { StreamTroubleshootingAlerts } from "./StreamTroubleshootingAlerts";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useState, useEffect } from "react";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);
  const { serverTest, testingServer, handleTestServer } = useServerTest();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Debug info using droplet IP
  useEffect(() => {
    if (streamData?.streamKey) {
      const dropletDebugInfo = {
        streamUrl: `http://67.205.179.77:3001/live/${streamData.streamKey}/index.m3u8`,
        streamKey: streamData.streamKey,
        rtmpUrl: `rtmp://67.205.179.77:1935/live`,
        expectedFormat: `http://67.205.179.77:8888/live/${streamData.streamKey}/index.m3u8`,
        status: isLive ? 'Live' : 'Connecting...',
        refreshKey: Date.now()
      };
      setDebugInfo(dropletDebugInfo);
      console.log('🎯 Droplet Debug Info:', dropletDebugInfo);
    }
  }, [streamData, isLive]);

  const handleRefresh = () => {
    if (debugInfo) {
      setDebugInfo({
        ...debugInfo,
        refreshKey: Date.now()
      });
    }
  };

  return (
    <GlassmorphicCard>
      <StreamStatusHeader
        isLive={isLive}
        viewerCount={viewerCount}
        streamDuration={streamDuration}
        streamUrl={streamData?.hlsUrl}
        onRefresh={handleRefresh}
        onTestServer={handleTestServer}
        onShowDiagnostics={() => setShowDiagnostics(!showDiagnostics)}
        testingServer={testingServer}
        formatDuration={formatDuration}
      />

      <div className="mt-4 space-y-4">
        <RealVideoPlayer 
          hlsUrl={debugInfo?.streamUrl || ''}
          isLive={isLive}
        />

        <StreamStatsGrid
          isLive={isLive}
          viewerCount={viewerCount}
          streamDuration={streamDuration}
          formatDuration={formatDuration}
        />

        <StreamTroubleshootingAlerts serverTest={serverTest} />

        <ServerTestResults serverTest={serverTest} />

        {showDiagnostics && debugInfo && (
          <StreamDiagnostics 
            streamKey={debugInfo.streamKey}
            rtmpUrl={debugInfo.rtmpUrl}
            hlsUrl={debugInfo.streamUrl}
          />
        )}
      </div>
    </GlassmorphicCard>
  );
};
