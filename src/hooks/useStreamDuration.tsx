
import { useState, useEffect } from 'react';

export const useStreamDuration = (isLive: boolean) => {
  const [streamDuration, setStreamDuration] = useState(0);

  useEffect(() => {
    if (!isLive) {
      setStreamDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setStreamDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    streamDuration,
    formatDuration
  };
};
