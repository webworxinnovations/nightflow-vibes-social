
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useHlsRetry } from './useHlsRetry';
import { useHlsConfig } from './useHlsConfig';
import { useVideoControls } from './useVideoControls';
import { useHlsErrorHandler } from './useHlsErrorHandler';
import { useStreamValidation } from './useStreamValidation';

interface UseHlsPlayerProps {
  hlsUrl: string;
  isLive?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}

export const useHlsPlayer = ({ hlsUrl, isLive = false, autoplay = false, muted = true }: UseHlsPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const hlsConfig = useHlsConfig({ isLive });
  const { clearRetryTimeout, scheduleRetry, resetRetryCount, getCurrentRetryCount, maxRetries } = useHlsRetry();
  const { 
    isPlaying, 
    isMuted, 
    setIsPlaying, 
    setIsMuted, 
    handlePlayPause: baseHandlePlayPause, 
    handleMuteToggle: baseHandleMuteToggle, 
    handleFullscreen: baseHandleFullscreen 
  } = useVideoControls(muted);

  const { validateStreamKey, logConnectionAttempt } = useStreamValidation();

  const attemptLoad = async () => {
    const video = videoRef.current;
    if (!video || !hlsUrl) {
      console.log('🎥 No video element or HLS URL provided');
      setIsLoading(false);
      return;
    }

    logConnectionAttempt(getCurrentRetryCount, maxRetries);
    
    const validation = validateStreamKey(hlsUrl);
    if (!validation.isValid) {
      setError(validation.error);
      setIsLoading(false);
      return;
    }

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log('🔧 Using HLS.js (browser supports MSE)');
      const hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest parsed successfully!');
        setIsLoading(false);
        setError(null);
        resetRetryCount();
        
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay blocked by browser:', err);
            setError('Click to play - autoplay blocked');
          });
        }
      });

      hls.on(Hls.Events.ERROR, handleHlsError);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('📺 Media successfully attached to video element');
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('🍎 Using Safari native HLS support');
      video.src = hlsUrl;
      
      video.addEventListener('loadedmetadata', () => {
        console.log('✅ Native HLS loaded successfully');
        setIsLoading(false);
        setError(null);
        resetRetryCount();
        
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay blocked:', err);
            setError('Click to play - autoplay blocked');
          });
        }
      });

      video.addEventListener('error', (e) => {
        console.error('❌ Native HLS Error:', e);
        
        const canRetry = scheduleRetry(() => {
          attemptLoad();
        }, 20000);

        if (canRetry) {
          setError(`Native playback error (${getCurrentRetryCount()}/${maxRetries}). Retrying in 20 seconds...`);
        } else {
          setError('Video playback not supported or stream unavailable');
          setIsLoading(false);
        }
      });
    } else {
      console.error('❌ HLS not supported in this browser');
      setError('HLS streaming not supported in this browser');
      setIsLoading(false);
    }
  };

  const { handleHlsError } = useHlsErrorHandler({
    hlsUrl,
    scheduleRetry,
    getCurrentRetryCount,
    maxRetries,
    setError,
    setIsLoading,
    attemptLoad
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) {
      console.log('🎥 HLS Player: Missing video element or URL');
      setIsLoading(false);
      return;
    }

    console.group('🎬 HLS Player Initialization');
    console.log('HLS URL:', hlsUrl);
    console.log('Is Live:', isLive);
    console.log('Autoplay:', autoplay);
    console.log('Muted:', muted);
    console.log('Browser HLS Support:', Hls.isSupported());
    console.log('Native HLS Support:', video.canPlayType('application/vnd.apple.mpegurl'));
    console.groupEnd();

    setError(null);
    setIsLoading(true);
    resetRetryCount();
    clearRetryTimeout();

    attemptLoad();

    return () => {
      clearRetryTimeout();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, autoplay, isLive]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    // Set initial muted state
    video.muted = isMuted;

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isMuted, setIsPlaying, setIsMuted]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      baseHandlePlayPause(video);
    } catch (err) {
      console.error('Play/pause error:', err);
      setError('Failed to control video playback');
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    baseHandleMuteToggle(video);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    baseHandleFullscreen(video);
  };

  // Handle media error recovery
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMediaError = () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.recoverMediaError();
        } catch (err) {
          console.error('Media recovery failed:', err);
          setError('Failed to recover from media error');
          setIsLoading(false);
        }
      }
    };

    video.addEventListener('error', handleMediaError);
    return () => video.removeEventListener('error', handleMediaError);
  }, []);

  return {
    videoRef,
    isPlaying,
    isMuted,
    error,
    isLoading,
    handlePlayPause,
    handleMuteToggle,
    handleFullscreen
  };
};
