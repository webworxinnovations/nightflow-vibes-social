
import { useState, useEffect, useCallback } from 'react';
import { streamingService } from '@/services/streamingService';
import { StreamConfig, StreamStatus } from '@/types/streaming';
import { StreamSecurity } from '@/utils/streamingSecurity';
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
    // Check rate limiting
    if (!StreamSecurity.canGenerateStreamKey()) {
      return;
    }

    setIsLoading(true);
    try {
      // Import here to avoid circular dependencies
      const { DatabaseService } = await import('@/services/streaming/databaseService');
      
      // Get user from auth context
      const user = (window as any).__supabase_user;
      if (!user?.id) {
        throw new Error('Authentication required to generate stream key');
      }
      
      StreamSecurity.logSecurityEvent('stream_key_generation_requested', { userId: user.id });
      
      const config = await DatabaseService.generateStreamKey(user.id);
      
      // Validate the generated URLs
      if (!StreamSecurity.validateStreamUrl(config.rtmpUrl) || !StreamSecurity.validateStreamUrl(config.hlsUrl)) {
        throw new Error('Generated stream URLs failed security validation');
      }
      
      setStreamConfig(config);
      StreamSecurity.logSecurityEvent('stream_key_generated_successfully', { 
        streamKey: StreamSecurity.sanitizeStreamKey(config.streamKey),
        userId: user.id 
      });
      
      toast.success('🔒 Secure stream key generated! Valid for 24 hours.');
      return config.streamKey;
    } catch (error) {
      StreamSecurity.logSecurityEvent('stream_key_generation_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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
      // Import here to avoid circular dependencies
      const { DatabaseService } = await import('@/services/streaming/databaseService');
      
      // Get user from auth context
      const user = (window as any).__supabase_user;
      if (!user?.id) {
        throw new Error('Authentication required to revoke stream key');
      }
      
      await DatabaseService.revokeStream(user.id, streamConfig?.streamKey);
      await streamingService.revokeStreamKey(); // Clear localStorage
      
      setStreamConfig(null);
      setStreamStatus({
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      });
      toast.info('Stream key securely revoked');
    } catch (error) {
      toast.error('Failed to revoke stream key');
    }
  }, [streamConfig?.streamKey]);

  const validateAndConnect = useCallback(async (streamKey: string) => {
    // Security checks
    if (!StreamSecurity.validateStreamKeyFormat(streamKey)) {
      StreamSecurity.logSecurityEvent('invalid_stream_key_format', { streamKey: StreamSecurity.sanitizeStreamKey(streamKey) });
      toast.error('Invalid stream key format');
      return false;
    }

    if (StreamSecurity.isStreamKeyExpired(streamKey)) {
      StreamSecurity.logSecurityEvent('expired_stream_key_access', { streamKey: StreamSecurity.sanitizeStreamKey(streamKey) });
      toast.error('Stream key has expired. Please generate a new one.');
      return false;
    }

    // Import here to avoid circular dependencies
    const { DatabaseService } = await import('@/services/streaming/databaseService');
    
    const isValid = await DatabaseService.validateStreamKey(streamKey);
    
    if (!isValid) {
      StreamSecurity.logSecurityEvent('stream_key_validation_failed', { streamKey: StreamSecurity.sanitizeStreamKey(streamKey) });
      toast.error('Invalid or expired stream key');
      return false;
    }

    StreamSecurity.logSecurityEvent('stream_key_validated_successfully', { streamKey: StreamSecurity.sanitizeStreamKey(streamKey) });

    // Connect to real-time status updates
    streamingService.connectToStreamStatusWebSocket(streamKey);
    
    return true;
  }, []);

  // Load current stream on mount
  useEffect(() => {
    const loadCurrentStream = async () => {
      setIsLoading(true);
      try {
        // Import here to avoid circular dependencies
        const { DatabaseService } = await import('@/services/streaming/databaseService');
        
        // Get user from auth context
        const user = (window as any).__supabase_user;
        if (!user?.id) {
          // Try localStorage fallback for backward compatibility
          const config = await streamingService.getCurrentStream();
          if (config) {
            setStreamConfig(config);
            if (config.streamKey) {
              validateAndConnect(config.streamKey);
            }
          }
          return;
        }
        
        const config = await DatabaseService.getCurrentStream(user.id);
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
