
import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { toast } from "sonner";
import { StreamHeader } from "./StreamHeader";
import { StreamActions } from "./StreamActions";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount, generateStreamKey } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);

  const debugInfo = useMemo(() => {
    if (streamData?.streamKey) {
      return {
        streamUrl: streamData.hlsUrl,
        streamKey: streamData.streamKey,
        rtmpUrl: streamData.rtmpUrl,
        status: isLive ? 'Live' : 'Ready for OBS'
      };
    }
    return null;
  }, [streamData?.streamKey, streamData?.hlsUrl, streamData?.rtmpUrl, isLive]);

  // Check for mixed content issues
  const hasMixedContentIssue = useMemo(() => {
    return window.location.protocol === 'https:' && 
           debugInfo?.streamUrl && 
           debugInfo.streamUrl.startsWith('http://');
  }, [debugInfo?.streamUrl]);

  const handleGenerateNewKey = async () => {
    try {
      toast.info('🔑 Generating new stream key for DigitalOcean droplet...');
      await generateStreamKey();
      toast.success('✅ New stream key generated! Copy settings to OBS and start streaming.');
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key. Check if your DigitalOcean droplet is running.');
    }
  };

  const handleClearAndRegenerate = async () => {
    try {
      toast.info('🔄 Resetting stream configuration for DigitalOcean droplet...');
      localStorage.removeItem('nightflow_stream_config');
      await handleGenerateNewKey();
    } catch (error) {
      console.error('Failed to clear and regenerate:', error);
      toast.error('Failed to reset stream configuration');
    }
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        {/* Stream Configuration Header */}
        <StreamHeader
          isLive={isLive}
          viewerCount={viewerCount}
          streamDuration={streamDuration}
          formatDuration={formatDuration}
        />

        {/* Stream Information */}
        {debugInfo && (
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h3 className="font-medium mb-3">Stream Configuration</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Stream Key:</strong> {debugInfo.streamKey}</div>
              <div><strong>RTMP URL:</strong> {debugInfo.rtmpUrl}</div>
              <div><strong>HLS URL:</strong> {debugInfo.streamUrl}</div>
              <div><strong>Status:</strong> {debugInfo.status}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {debugInfo && (
          <>
            <StreamActions
              onGenerateNewKey={handleGenerateNewKey}
              onClearAndRegenerate={handleClearAndRegenerate}
            />
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  console.log('🧪 Testing droplet server connection...');
                  try {
                    const response = await fetch('https://67.205.179.77:3443/health', {
                      method: 'GET',
                      signal: AbortSignal.timeout(5000)
                    });
                    if (response.ok) {
                      console.log('✅ Droplet server is responding!');
                      alert('✅ Server is online and responding!');
                    } else {
                      console.log('⚠️ Server responded with status:', response.status);
                      alert(`⚠️ Server responded with status: ${response.status}`);
                    }
                  } catch (error) {
                    console.error('❌ Server connection failed:', error);
                    alert('❌ Cannot connect to droplet server. Make sure it\'s running on port 3443.');
                  }
                }}
              >
                Test Server
              </Button>
            </div>
          </>
        )}

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
