
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface StreamKeyData {
  streamKey: string;
  rtmpUrl: string;
  streamUrl: string;
  isActive: boolean;
  viewerCount: number;
}

export const useStreamKey = () => {
  const [streamData, setStreamData] = useState<StreamKeyData>({
    streamKey: '',
    rtmpUrl: 'rtmp://ingest.nightflow.app/live',
    streamUrl: '',
    isActive: false,
    viewerCount: 0
  });

  const generateStreamKey = () => {
    const key = `nf_live_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
    const newStreamData = {
      ...streamData,
      streamKey: key,
      streamUrl: `https://stream.nightflow.app/live/${key}`
    };
    setStreamData(newStreamData);
    
    // Store in localStorage for persistence
    localStorage.setItem('nightflow_stream_key', JSON.stringify(newStreamData));
    toast.success('New stream key generated!');
    return key;
  };

  const revokeStreamKey = () => {
    setStreamData(prev => ({
      ...prev,
      streamKey: '',
      streamUrl: '',
      isActive: false
    }));
    localStorage.removeItem('nightflow_stream_key');
    toast.info('Stream key revoked');
  };

  // Simulate stream status monitoring (in real app, this would be WebSocket/polling)
  useEffect(() => {
    if (!streamData.streamKey) return;

    const interval = setInterval(() => {
      // Simulate checking if stream is active
      const isLive = Math.random() > 0.7; // Simulate OBS streaming status
      
      if (isLive !== streamData.isActive) {
        setStreamData(prev => ({
          ...prev,
          isActive: isLive,
          viewerCount: isLive ? Math.floor(Math.random() * 100) + 10 : 0
        }));
        
        if (isLive) {
          toast.success('🔴 Stream is now LIVE!');
        } else {
          toast.info('Stream ended');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [streamData.streamKey, streamData.isActive]);

  // Load saved stream key on mount
  useEffect(() => {
    const saved = localStorage.getItem('nightflow_stream_key');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setStreamData(parsedData);
      } catch (error) {
        console.error('Failed to load saved stream key:', error);
      }
    }
  }, []);

  return {
    streamData,
    generateStreamKey,
    revokeStreamKey,
    isLive: streamData.isActive,
    viewerCount: streamData.viewerCount
  };
};
