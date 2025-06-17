
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to generate stream key');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeStreamKey = useCallback(async () => {
    try {
      await streamingService.revokeStreamKey();
      setStreamConfig(null);
      setStreamStatus({
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: ''
      });
      toast.info('Stream key revoked');
    } catch (error) {
      console.error('Failed to revoke stream key:', error);
      toast.error('Failed to revoke stream key');
    }
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

  // Load current stream on mount
  useEffect(() => {
    const loadCurrentStream = async () => {
      setIsLoading(true);
      try {
        const config = await streamingService.getCurrentStream();
        if (config) {
          setStreamConfig(config);
          
          // Start monitoring if we have a stream
          if (config.streamKey) {
            validateAndConnect(config.streamKey);
          }
        }
      } catch (error) {
        console.error('Failed to load current stream:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentStream();
  }, [validateAndConnect]);

  // Set up status monitoring when stream config changes
  useEffect(() => {
    if (!streamConfig?.streamKey) return;

    const unsubscribe = streamingService.onStatusUpdate((status) => {
      setStreamStatus(prevStatus => {
        // Show live status changes
        if (status.isLive && !prevStatus.isLive) {
          toast.success('🔴 Stream is now LIVE!');
        } else if (!status.isLive && prevStatus.isLive) {
          toast.info('Stream ended');
        }
        
        return status;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [streamConfig?.streamKey]);

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

