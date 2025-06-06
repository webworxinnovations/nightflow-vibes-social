
import { useRealTimeStream } from './useRealTimeStream';

// Backward compatibility wrapper
export const useStreamKey = () => {
  const {
    streamConfig,
    streamStatus,
    isLoading,
    generateStreamKey,
    revokeStreamKey,
    isLive,
    viewerCount
  } = useRealTimeStream();

  return {
    streamData: {
      streamKey: streamConfig?.streamKey || '',
      rtmpUrl: streamConfig?.rtmpUrl || 'rtmp://ingest.nightflow.app/live',
      streamUrl: streamConfig?.hlsUrl || '',
      isActive: isLive,
      viewerCount: viewerCount
    },
    generateStreamKey,
    revokeStreamKey,
    isLive,
    viewerCount,
    isLoading
  };
};
