
import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount, generateStreamKey } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);

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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        {/* Stream Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" />
              Stream Configuration
            </h3>
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-medium">LIVE</span>
                <span className="text-muted-foreground">
                  {viewerCount} viewers • {formatDuration(streamDuration)}
                </span>
              </div>
            )}
          </div>

          {debugInfo ? (
            <div className="space-y-4">
              {/* RTMP Server URL */}
              <div className="space-y-2">
                <Label className="text-blue-400">OBS Server URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={debugInfo.rtmpUrl}
                    readOnly
                    className="font-mono text-sm bg-blue-500/10 border-blue-500/20"
                  />
                  <Button
                    onClick={() => copyToClipboard(debugInfo.rtmpUrl, 'Server URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-2">
                <Label className="text-green-400">Stream Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={debugInfo.streamKey}
                    readOnly
                    type="password"
                    className="font-mono text-sm bg-green-500/10 border-green-500/20"
                  />
                  <Button
                    onClick={() => copyToClipboard(debugInfo.streamKey, 'Stream key')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={generateStreamKey}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Stream Key
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Button onClick={generateStreamKey} className="bg-blue-600 hover:bg-blue-700">
                <Key className="mr-2 h-4 w-4" />
                Generate Stream Key
              </Button>
            </div>
          )}
        </div>

        {/* Video Player */}
        <RealVideoPlayer 
          hlsUrl={debugInfo?.streamUrl || ''}
          isLive={isLive}
        />

        {/* Stream Stats */}
        <StreamStatsGrid
          isLive={isLive}
          viewerCount={viewerCount}
          streamDuration={streamDuration}
          formatDuration={formatDuration}
        />
      </div>
    </GlassmorphicCard>
  );
};
