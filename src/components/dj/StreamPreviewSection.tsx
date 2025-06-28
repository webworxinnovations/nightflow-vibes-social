
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
import { EnvironmentConfig } from "@/services/streaming/core/environment";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);
  const { serverTest, testingServer, handleTestServer } = useServerTest();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleRefreshStream = () => {
    console.log('🔄 Refreshing stream player...');
    setRefreshKey(prev => prev + 1);
  };

  // Debug stream configuration
  useEffect(() => {
    if (streamData?.streamKey) {
      console.log('🎬 StreamPreviewSection Debug Info:');
      console.log('- Stream Data:', streamData);
      console.log('- Stream URL:', streamData?.streamUrl);
      console.log('- Is Live:', isLive);
      console.log('- Viewer Count:', viewerCount);
      
      // Use the debug method to verify URLs
      EnvironmentConfig.debugUrls(streamData.streamKey);
    }
  }, [streamData, isLive, viewerCount]);

  if (!streamData?.streamUrl) {
    return (
      <GlassmorphicCard>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📺</div>
          <h3 className="text-lg font-semibold mb-2">No Active Stream</h3>
          <p className="text-muted-foreground mb-4">
            Your stream preview will appear here when you start broadcasting from OBS.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Debug Info:</p>
            <p>Stream Key: {streamData?.streamKey || 'Not generated'}</p>
            <p>RTMP URL: {streamData?.rtmpUrl || 'Not configured'}</p>
          </div>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="space-y-4">
          <StreamStatusHeader
            isLive={isLive}
            viewerCount={viewerCount}
            streamDuration={streamDuration}
            streamUrl={streamData.streamUrl}
            onRefresh={handleRefreshStream}
            onTestServer={handleTestServer}
            onShowDiagnostics={() => setShowDiagnostics(!showDiagnostics)}
            testingServer={testingServer}
            formatDuration={formatDuration}
          />

          <ServerTestResults serverTest={serverTest} />

          {/* Video Player Preview */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <RealVideoPlayer
              key={refreshKey}
              hlsUrl={streamData.streamUrl}
              isLive={isLive}
              autoplay={false}
              muted={true}
              className="w-full h-full"
            />
            
            {/* Preview Label Overlay */}
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              DJ Preview
            </div>
          </div>

          <StreamTroubleshootingAlerts serverTest={serverTest} />

          {/* Debug Information */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <details>
              <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
              <div className="space-y-1">
                <p><strong>Stream URL:</strong> {streamData.streamUrl}</p>
                <p><strong>Stream Key:</strong> {streamData.streamKey}</p>
                <p><strong>RTMP URL:</strong> {streamData.rtmpUrl}</p>
                <p><strong>Expected Format:</strong> http://67.205.179.77:8888/live/[streamKey]/index.m3u8</p>
                <p><strong>Status:</strong> {isLive ? 'Live' : 'Connecting...'}</p>
                <p><strong>Refresh Key:</strong> {refreshKey}</p>
              </div>
            </details>
          </div>

          <StreamStatsGrid
            isLive={isLive}
            viewerCount={viewerCount}
            streamDuration={streamDuration}
            formatDuration={formatDuration}
          />

          {/* Instructions */}
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              {isLive 
                ? "🎉 You're live! This is how your stream appears to viewers. Keep creating amazing content!"
                : "📡 Stream is connecting... The video should appear within 30-60 seconds after starting OBS. If not, check the troubleshooting tips above."
              }
            </p>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Diagnostics Panel */}
      {showDiagnostics && streamData && (
        <StreamDiagnostics
          streamKey={streamData.streamKey}
          rtmpUrl={streamData.rtmpUrl}
          hlsUrl={streamData.streamUrl}
        />
      )}
    </div>
  );
};
