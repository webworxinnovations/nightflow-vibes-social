
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRealTimeStream } from './useRealTimeStream';

export const useStreamKey = () => {
  const { user } = useSupabaseAuth();
  const { streamConfig, isLive: streamIsLive, viewerCount: streamViewerCount, generateStreamKey: generateKey } = useRealTimeStream();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    setIsLive(streamIsLive || false);
    setViewerCount(streamViewerCount || 0);
  }, [streamIsLive, streamViewerCount]);

  // Debug logging
  useEffect(() => {
    if (streamConfig) {
      console.log('🎯 useStreamKey - Stream config updated:');
      console.log('- Stream Key:', streamConfig.streamKey);
      console.log('- RTMP URL:', streamConfig.rtmpUrl);
      console.log('- HLS URL:', streamConfig.hlsUrl);
      console.log('- Is Live:', isLive);
      console.log('- Viewer Count:', viewerCount);
    }
  }, [streamConfig, isLive, viewerCount]);

  // Create streamData object for backward compatibility - ensure correct URLs
  const streamData = streamConfig ? {
    streamKey: streamConfig.streamKey,
    streamUrl: streamConfig.hlsUrl, // Use HLS URL for video playback
    rtmpUrl: streamConfig.rtmpUrl,
    hlsUrl: streamConfig.hlsUrl
  } : null;

  return {
    streamKey: streamConfig?.streamKey || '',
    isLive,
    viewerCount,
    hlsUrl: streamConfig?.hlsUrl || '',
    rtmpUrl: streamConfig?.rtmpUrl || '',
    streamData,
    generateStreamKey: generateKey
  };
};
