
import { useStreamKey } from "@/hooks/useStreamKey";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamDiagnostics } from "./StreamDiagnostics";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Badge } from "@/components/ui/badge";
import { Users, Timer, Activity, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EnvironmentConfig } from "@/services/streaming/core/environment";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount } = useStreamKey();
  const [streamDuration, setStreamDuration] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (!isLive) {
      setStreamDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setStreamDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
          {/* Stream Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Your Live Stream</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefreshStream}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              <Button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                🔍 Diagnostics
              </Button>
              
              {isLive ? (
                <Badge variant="destructive" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </Badge>
              ) : (
                <Badge variant="secondary">CONNECTING...</Badge>
              )}
              
              {streamData.streamUrl && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {viewerCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {formatDuration(streamDuration)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Broadcasting
                  </div>
                </div>
              )}
            </div>
          </div>

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

          {/* Troubleshooting Alert */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-400">Stream Troubleshooting</span>
            </div>
            <div className="text-sm text-yellow-300 space-y-1">
              <p>If your stream isn't appearing after starting OBS:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Wait 30-60 seconds after clicking "Start Streaming" in OBS</li>
                <li>Make sure OBS is using: <code className="bg-black/20 px-1 rounded">rtmp://67.205.179.77:1935/live</code></li>
                <li>Check that your stream key matches the one shown in diagnostics</li>
                <li>Try clicking the "Refresh" button above</li>
                <li>If still not working, stop and restart OBS streaming</li>
              </ul>
            </div>
          </div>

          {/* Debug Information */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <details>
              <summary className="cursor-pointer font-medium mb-2">Debug Information</summary>
              <div className="space-y-1">
                <p><strong>Stream URL:</strong> {streamData.streamUrl}</p>
                <p><strong>Stream Key:</strong> {streamData.streamKey}</p>
                <p><strong>RTMP URL:</strong> {streamData.rtmpUrl}</p>
                <p><strong>Expected Format:</strong> http://67.205.179.77:8080/live/[streamKey]/index.m3u8</p>
                <p><strong>Status:</strong> {isLive ? 'Live' : 'Connecting...'}</p>
                <p><strong>Refresh Key:</strong> {refreshKey}</p>
              </div>
            </details>
          </div>

          {/* Stream Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">
                {isLive ? '🔴 LIVE' : '🔄 Connecting...'}
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground">Viewers</div>
              <div className="font-medium">{viewerCount}</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium">{formatDuration(streamDuration)}</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground">Quality</div>
              <div className="font-medium">
                {isLive ? 'HD' : 'Connecting...'}
              </div>
            </div>
          </div>

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
