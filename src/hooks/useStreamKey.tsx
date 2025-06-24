
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRealTimeStream } from './useRealTimeStream';

export const useStreamKey = () => {
  const { user } = useSupabaseAuth();
  const { streamConfig, isLive: streamIsLive, viewerCount: streamViewerCount } = useRealTimeStream();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    setIsLive(streamIsLive || false);
    setViewerCount(streamViewerCount || 0);
  }, [streamIsLive, streamViewerCount]);

  return {
    streamKey: streamConfig?.streamKey || '',
    isLive,
    viewerCount,
    hlsUrl: streamConfig?.hlsUrl || '',
    rtmpUrl: streamConfig?.rtmpUrl || ''
  };
};
