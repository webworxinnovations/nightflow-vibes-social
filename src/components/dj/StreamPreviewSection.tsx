
import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { useServerTest } from "@/hooks/useServerTest";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamDiagnostics } from "./StreamDiagnostics";
import { StreamStatusHeader } from "./StreamStatusHeader";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { StreamTroubleshootingAlerts } from "./StreamTroubleshootingAlerts";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

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
        expectedFormat: `http://67.205.179.77:3001/live/${streamData.streamKey}/index.m3u8`,
        status: isLive ? 'Live' : 'Ready for OBS'
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

  // More lenient server detection - assume server is working unless we have clear evidence it's not
  const isServerOffline = serverTest && serverTest.available === false && serverTest.details.some(detail => 
    detail.includes('Connection failed') || detail.includes('timeout') || detail.includes('Network error')
  );

  return (
    <GlassmorphicCard>
      {/* Only show server offline alert if we have concrete evidence the server is down */}
      {isServerOffline && (
        <Alert className="mb-4 border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            <strong>Server Connection Issue:</strong> Cannot connect to your streaming server at 67.205.179.77. 
            This may be a temporary network issue or firewall blocking the connection.
          </AlertDescription>
        </Alert>
      )}

      {/* Show ready status when server is available or when we can't determine status */}
      {(!isServerOffline && debugInfo) && (
        <Alert className="mb-4 border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            <strong>Ready for OBS:</strong> Configure OBS with rtmp://67.205.179.77:1935/live and your stream key.
          </AlertDescription>
        </Alert>
      )}

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
