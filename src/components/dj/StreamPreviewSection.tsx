
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
import { useState, useEffect, useMemo } from "react";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);
  const { serverTest, testingServer, handleTestServer } = useServerTest();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Use useMemo to prevent infinite loops - only recalculate when streamData changes
  const debugInfo = useMemo(() => {
    if (streamData?.streamKey) {
      return {
        streamUrl: `http://67.205.179.77:3001/live/${streamData.streamKey}/index.m3u8`,
        streamKey: streamData.streamKey,
        rtmpUrl: `rtmp://67.205.179.77:1935/live`,
        expectedFormat: `http://67.205.179.77:8888/live/${streamData.streamKey}/index.m3u8`,
        status: isLive ? 'Live' : 'Connecting...'
      };
    }
    return null;
  }, [streamData?.streamKey, isLive]);

  // Only log when debugInfo actually changes
  useEffect(() => {
    if (debugInfo) {
      console.log('🎯 Droplet Debug Info:', debugInfo);
    }
  }, [debugInfo]);

  const handleRefresh = () => {
    // Force a refresh by triggering the server test
    handleTestServer();
  };

  return (
    <GlassmorphicCard>
      <StreamStatusHeader
        isLive={isLive}
        viewerCount={viewerCount}
        streamDuration={streamDuration}
        streamUrl={debugInfo?.streamUrl}
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
