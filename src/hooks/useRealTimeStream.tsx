
import { useState, useEffect, useCallback } from 'react';
import { streamingService } from '@/services/streamingService';
import { StreamConfig, StreamStatus } from '@/types/streaming';
import { toast } from 'sonner';

export const useRealTimeStream = () => {
  const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    viewerCount: 0,
    duration: 0,
    bitrate: 0,
    resolution: '',
    timestamp: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateStreamKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await streamingService.generateStreamKey();
      setStreamConfig(config);
      toast.success('Stream key generated! Copy the settings to OBS.');
      return config.streamKey;
    } catch (error) {
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
        resolution: '',
        timestamp: new Date().toISOString()
      });
      toast.info('Stream key revoked');
    } catch (error) {
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
        // Silent fail - user will need to generate new stream key
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentStream();
  }, [validateAndConnect]);

  // Set up status monitoring when stream config changes
  useEffect(() => {
    if (!streamConfig?.streamKey) return;

    // Poll stream status every 3 seconds to detect when OBS starts streaming
    const pollStreamStatus = async () => {
      try {
        const status = await streamingService.getStreamStatus(streamConfig.streamKey);
        setStreamStatus(prevStatus => {
          // Only show meaningful status changes
          const wasLive = prevStatus.isLive;
          const isNowLive = status.isLive;
          
          if (!wasLive && isNowLive) {
            toast.success('🔴 Stream is now LIVE!');
          } else if (wasLive && !isNowLive) {
            toast.info('Stream ended');
          }
          
          return status;
        });
        } catch (error) {
          // Silent fail - polling will retry
        }
    };

    // Initial status check
    pollStreamStatus();
    
    // Poll every 3 seconds
    const pollInterval = setInterval(pollStreamStatus, 3000);

    const unsubscribe = streamingService.onStatusUpdate((status) => {
      setStreamStatus(prevStatus => {
        // Only show meaningful status changes
        const wasLive = prevStatus.isLive;
        const isNowLive = status.isLive;
        
        if (!wasLive && isNowLive) {
          toast.success('🔴 Stream is now LIVE!');
        } else if (wasLive && !isNowLive) {
          toast.info('Stream ended');
        }
        
        return status;
      });
    });

    return () => {
      clearInterval(pollInterval);
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
