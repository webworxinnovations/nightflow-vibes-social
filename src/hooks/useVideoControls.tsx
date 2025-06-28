
import { useState, useCallback } from 'react';

export const useVideoControls = (initialMuted: boolean = true) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);

  const handlePlayPause = useCallback((video: HTMLVideoElement) => {
    if (video.paused) {
      video.play().catch(err => {
        console.error('Play failed:', err);
        throw new Error('Failed to play video');
      });
    } else {
      video.pause();
    }
  }, []);

  const handleMuteToggle = useCallback((video: HTMLVideoElement) => {
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleFullscreen = useCallback((video: HTMLVideoElement) => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  }, []);

  return {
    isPlaying,
    isMuted,
    setIsPlaying,
    setIsMuted,
    handlePlayPause,
    handleMuteToggle,
    handleFullscreen
  };
};
