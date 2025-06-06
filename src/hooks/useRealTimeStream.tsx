
import { useState, useEffect, useCallback } from 'react';
import { streamingService, StreamConfig, StreamStatus } from '@/services/streamingService';
import { toast } from 'sonner';

export const useRealTimeStream = () => {
  const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    viewerCount: 0,
    duration: 0,
    bitrate: 0,
    resolution: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateStreamKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await streamingService.generateStreamKey();
      setStreamConfig(config);
      toast.success('Stream key generated! Ready to stream from OBS.');
      return config.streamKey;
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeStreamKey = useCallback(() => {
    setStreamConfig(null);
    localStorage.removeItem('nightflow_stream_config');
    streamingService.disconnect();
    toast.info('Stream key revoked');
  }, []);

  const validateAndConnect = useCallback(async (streamKey: string) => {
    const isValid = await streamingService.validateStreamKey(streamKey);
    
    if (!isValid) {
      toast.error('Invalid stream key');
      return false;
    }

    // Connect to real-time status updates
    streamingService.connectToStreamStatusWebSocket(streamKey);
    
    return true;
  }, []);

  // Set up status monitoring when stream config changes
  useEffect(() => {
    if (!streamConfig?.streamKey) return;

    const unsubscribe = streamingService.onStatusUpdate((status) => {
      setStreamStatus(status);
      
      // Show live status changes
      if (status.isLive && !streamStatus.isLive) {
        toast.success('🔴 Stream is now LIVE!');
      } else if (!status.isLive && streamStatus.isLive) {
        toast.info('Stream ended');
      }
    });

    // Start monitoring
    validateAndConnect(streamConfig.streamKey);

    return () => {
      unsubscribe();
    };
  }, [streamConfig?.streamKey, validateAndConnect]);

  // Load saved config on mount
  useEffect(() => {
    const saved = localStorage.getItem('nightflow_stream_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setStreamConfig(config);
      } catch (error) {
        console.error('Failed to load saved stream config:', error);
        localStorage.removeItem('nightflow_stream_config');
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamingService.disconnect();
    };
  }, []);

  return {
    streamConfig,
    streamStatus,
    isLoading,
    generateStreamKey,
    revokeStreamKey,
    isLive: streamStatus.isLive,
    viewerCount: streamStatus.viewerCount,
    duration: streamStatus.duration,
    bitrate: streamStatus.bitrate,
    resolution: streamStatus.resolution
  };
};
