
import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useMemo } from "react";
import { toast } from "sonner";
import { StreamHeader } from "./StreamHeader";
import { StreamAlerts } from "./StreamAlerts";
import { StreamConfiguration } from "./StreamConfiguration";
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

        {/* Alert Messages */}
        <StreamAlerts hasMixedContentIssue={hasMixedContentIssue} />

        {/* Stream Configuration Panel */}
        <StreamConfiguration
          debugInfo={debugInfo}
          hasMixedContentIssue={hasMixedContentIssue}
          onGenerateNewKey={handleGenerateNewKey}
          onClearAndRegenerate={handleClearAndRegenerate}
        />

        {/* Action Buttons */}
        {debugInfo && (
          <StreamActions
            onGenerateNewKey={handleGenerateNewKey}
            onClearAndRegenerate={handleClearAndRegenerate}
          />
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
