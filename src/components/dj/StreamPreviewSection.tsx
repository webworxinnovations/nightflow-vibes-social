
import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Key, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount, generateStreamKey } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);

  // Use the correct HLS URL from database
  const debugInfo = useMemo(() => {
    if (streamData?.streamKey) {
      return {
        streamUrl: streamData.hlsUrl, // Use the HLS URL from database
        streamKey: streamData.streamKey,
        rtmpUrl: streamData.rtmpUrl,
        status: isLive ? 'Live' : 'Ready for OBS'
      };
    }
    return null;
  }, [streamData?.streamKey, streamData?.hlsUrl, streamData?.rtmpUrl, isLive]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleGenerateNewKey = async () => {
    try {
      toast.info('🔑 Generating new stream key with correct configuration...');
      await generateStreamKey();
      toast.success('✅ New stream key generated! Ready for OBS.');
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key. Please try again.');
    }
  };

  const handleClearAndRegenerate = async () => {
    try {
      toast.info('🔄 Clearing old configuration and generating fresh stream key...');
      
      // Clear any localStorage cache
      localStorage.removeItem('nightflow_stream_config');
      
      // Generate new key
      await handleGenerateNewKey();
    } catch (error) {
      console.error('Failed to clear and regenerate:', error);
      toast.error('Failed to reset stream configuration');
    }
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
              {/* Success Message */}
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-green-400 font-medium">
                    ✅ Stream configuration ready! Using correct ports (RTMP: 1935, HLS: 3001)
                  </p>
                </div>
              </div>

              {/* OBS Server URL */}
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

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateNewKey}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Stream Key
                </Button>
                <Button
                  onClick={handleClearAndRegenerate}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear & Reset
                </Button>
              </div>

              {/* Debug Info - Now shows correct ports */}
              <div className="text-xs text-muted-foreground bg-slate-800/50 p-2 rounded">
                <p>✅ HLS URL: {debugInfo.streamUrl} (Port 3001 - FIXED)</p>
                <p>✅ RTMP URL: {debugInfo.rtmpUrl} (Port 1935 - Standard)</p>
                <p>Status: {debugInfo.status}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                <p className="text-amber-400 text-sm">
                  ⚠️ No stream configuration found. Generate a new one to get started.
                </p>
              </div>
              <Button onClick={handleClearAndRegenerate} className="bg-blue-600 hover:bg-blue-700">
                <Key className="mr-2 h-4 w-4" />
                Generate Fresh Stream Key
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
