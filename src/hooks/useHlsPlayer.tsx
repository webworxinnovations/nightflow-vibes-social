
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface UseHlsPlayerProps {
  hlsUrl: string;
  isLive?: boolean;
  autoplay?: boolean;
  muted?: boolean;
}

export const useHlsPlayer = ({ hlsUrl, isLive = false, autoplay = false, muted = true }: UseHlsPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    setError(null);
    setIsLoading(true);

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    console.log('🎥 Loading HLS stream:', hlsUrl);
    console.log('🔍 Stream URL breakdown:');
    console.log('- Full URL:', hlsUrl);
    console.log('- FIXED Expected format: http://67.205.179.77:8080/live/{streamKey}/index.m3u8');

    const attemptLoad = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: isLive,
          backBufferLength: isLive ? 4 : 30,
          maxBufferLength: isLive ? 10 : 30,
          maxMaxBufferLength: isLive ? 15 : 60,
          liveSyncDurationCount: isLive ? 1 : 3,
          liveMaxLatencyDurationCount: isLive ? 3 : 10,
        });

        hlsRef.current = hls;

        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest loaded successfully for:', hlsUrl);
          setIsLoading(false);
          setError(null);
          
          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setError('Click to play - autoplay blocked by browser');
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS Error for URL:', hlsUrl);
          console.error('❌ Error details:', data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('🌐 Network error - stream may not be ready yet');
                setError('Connecting to stream...');
                setIsLoading(true);
                
                // Retry after 5 seconds for network errors
                retryTimeoutRef.current = setTimeout(() => {
                  console.log('🔄 Retrying stream connection...');
                  attemptLoad();
                }, 5000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('📺 Media error - attempting recovery');
                setError('Media error - trying to recover...');
                try {
                  hls.recoverMediaError();
                } catch (err) {
                  setError('Failed to recover from media error');
                  setIsLoading(false);
                }
                break;
              default:
                setError('Stream connection failed - retrying...');
                setIsLoading(true);
                retryTimeoutRef.current = setTimeout(() => {
                  attemptLoad();
                }, 3000);
                break;
            }
          }
        });

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('📺 Media attached to video element for URL:', hlsUrl);
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        console.log('🍎 Using Safari native HLS support for:', hlsUrl);
        video.src = hlsUrl;
        
        video.addEventListener('loadedmetadata', () => {
          console.log('✅ Native HLS loaded successfully for:', hlsUrl);
          setIsLoading(false);
          setError(null);
          
          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setError('Click to play - autoplay blocked by browser');
            });
          }
        });

        video.addEventListener('error', (e) => {
          console.error('❌ Native HLS Error for URL:', hlsUrl, e);
          setError('Connecting to stream...');
          setIsLoading(true);
          
          // Retry for Safari too
          retryTimeoutRef.current = setTimeout(() => {
            attemptLoad();
          }, 5000);
        });
      } else {
        setError('HLS not supported in this browser');
        setIsLoading(false);
      }
    };

    attemptLoad();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
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
  }, [isMuted]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    } else {
      video.pause();
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
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
