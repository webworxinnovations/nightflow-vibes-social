
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useHlsRetry } from './useHlsRetry';
import { useHlsConfig } from './useHlsConfig';
import { useVideoControls } from './useVideoControls';

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

  const handleHlsError = (event: any, data: any) => {
    console.error('❌ HLS Error Details:');
    console.error('- Type:', data.type);
    console.error('- Details:', data.details);
    console.error('- Fatal:', data.fatal);
    console.error('- URL:', data.url);
    console.error('- Response:', data.response);
    
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('🌐 Network error - Stream may not be available yet');
          
          const canRetry = scheduleRetry(() => {
            console.log(`🔄 Retrying HLS connection (${getCurrentRetryCount()}/${maxRetries})...`);
            attemptLoad();
          });

          if (canRetry) {
            setError(`Stream not ready. Retrying (${getCurrentRetryCount()}/${maxRetries})...`);
          } else {
            console.error('❌ All HLS connection attempts failed');
            setError('Stream not available. Make sure OBS is streaming and wait 60 seconds after starting.');
            setIsLoading(false);
          }
          break;
          
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('📺 Media error - attempting recovery');
          setError('Media error - trying to recover...');
          try {
            hlsRef.current?.recoverMediaError();
          } catch (err) {
            console.error('Recovery failed:', err);
            setError('Failed to recover from media error');
            setIsLoading(false);
          }
          break;
          
        default:
          console.error('❌ Fatal HLS error:', data.type);
          setError(`Stream error: ${data.details}`);
          setIsLoading(false);
          break;
      }
    } else {
      console.warn('⚠️ Non-fatal HLS error:', data.type, data.details);
    }
  };

  const attemptLoad = () => {
    const video = videoRef.current;
    if (!video || !hlsUrl) {
      console.log('🎥 HLS Player: No video element or HLS URL provided');
      setIsLoading(false);
      return;
    }

    console.log(`🔄 HLS Connection attempt ${getCurrentRetryCount() + 1}/${maxRetries}`);
    console.log('🎯 Attempting to load:', hlsUrl);
    
    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest loaded successfully!');
        console.log('✅ Stream is ready for playback');
        setIsLoading(false);
        setError(null);
        resetRetryCount();
        
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Click to play - autoplay blocked by browser');
          });
        }
      });

      hls.on(Hls.Events.ERROR, handleHlsError);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('📺 Media attached to video element');
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      console.log('🍎 Using Safari native HLS support');
      video.src = hlsUrl;
      
      video.addEventListener('loadedmetadata', () => {
        console.log('✅ Native HLS loaded successfully');
        setIsLoading(false);
        setError(null);
        resetRetryCount();
        
        if (autoplay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Click to play - autoplay blocked by browser');
          });
        }
      });

      video.addEventListener('error', (e) => {
        console.error('❌ Native HLS Error:', e);
        console.error('- Error code:', video.error?.code);
        console.error('- Error message:', video.error?.message);
        
        const canRetry = scheduleRetry(() => {
          attemptLoad();
        });

        if (canRetry) {
          setError(`Native HLS attempt ${getCurrentRetryCount()}/${maxRetries} failed. Retrying...`);
        } else {
          setError('Stream not available. Check OBS is streaming and server is running.');
          setIsLoading(false);
        }
      });
    } else {
      setError('HLS not supported in this browser');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) {
      console.log('🎥 HLS Player: No video element or HLS URL provided');
      setIsLoading(false);
      return;
    }

    console.log('🎥 HLS Player Debug - Starting connection:');
    console.log('- HLS URL:', hlsUrl);
    console.log('- Is Live:', isLive);
    console.log('- Autoplay:', autoplay);
    console.log('- Muted:', muted);

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
      setError('Failed to play video');
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
