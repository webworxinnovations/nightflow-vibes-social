
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
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    setError(null);
    setIsLoading(true);
    retryCountRef.current = 0;

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
    console.log('🔍 Stream URL analysis:');
    console.log('- Full URL:', hlsUrl);
    console.log('- Expected server: 67.205.179.77:8080');
    console.log('- Expected format: http://67.205.179.77:8080/live/{streamKey}/index.m3u8');

    const attemptLoad = () => {
      console.log(`🔄 Attempt ${retryCountRef.current + 1}/${maxRetries} to load stream`);
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: isLive,
          backBufferLength: isLive ? 2 : 30,
          maxBufferLength: isLive ? 8 : 30,
          maxMaxBufferLength: isLive ? 12 : 60,
          liveSyncDurationCount: isLive ? 1 : 3,
          liveMaxLatencyDurationCount: isLive ? 2 : 10,
          // More aggressive retry settings
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          manifestLoadingRetryDelay: 1000,
        });

        hlsRef.current = hls;

        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest loaded successfully!');
          console.log('✅ Stream is ready for playback');
          setIsLoading(false);
          setError(null);
          retryCountRef.current = 0;
          
          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setError('Click to play - autoplay blocked by browser');
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS Error:', data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('🌐 Network error - checking stream availability');
                
                if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  const retryDelay = Math.min(3000 * retryCountRef.current, 15000);
                  
                  setError(`Connecting to stream... (attempt ${retryCountRef.current}/${maxRetries})`);
                  
                  retryTimeoutRef.current = setTimeout(() => {
                    console.log(`🔄 Retrying connection (${retryCountRef.current}/${maxRetries})...`);
                    attemptLoad();
                  }, retryDelay);
                } else {
                  console.error('❌ Max retries reached - stream may not be available');
                  setError('Stream not available. Make sure OBS is streaming and try refreshing.');
                  setIsLoading(false);
                }
                break;
                
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('📺 Media error - attempting recovery');
                setError('Media error - trying to recover...');
                try {
                  hls.recoverMediaError();
                } catch (err) {
                  console.error('Recovery failed:', err);
                  setError('Failed to recover from media error');
                  setIsLoading(false);
                }
                break;
                
              default:
                console.error('❌ Fatal HLS error:', data.type);
                setError('Stream connection failed - check OBS is streaming');
                setIsLoading(false);
                break;
            }
          } else {
            console.warn('⚠️ Non-fatal HLS error:', data.type, data.details);
          }
        });

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('📺 Media attached to video element');
        });

        hls.on(Hls.Events.LEVEL_LOADED, () => {
          console.log('📊 Stream level loaded - stream is active');
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        console.log('🍎 Using Safari native HLS support');
        video.src = hlsUrl;
        
        video.addEventListener('loadedmetadata', () => {
          console.log('✅ Native HLS loaded successfully');
          setIsLoading(false);
          setError(null);
          retryCountRef.current = 0;
          
          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setError('Click to play - autoplay blocked by browser');
            });
          }
        });

        video.addEventListener('error', (e) => {
          console.error('❌ Native HLS Error:', e);
          
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setError(`Connecting to stream... (attempt ${retryCountRef.current}/${maxRetries})`);
            
            retryTimeoutRef.current = setTimeout(() => {
              attemptLoad();
            }, 3000 * retryCountRef.current);
          } else {
            setError('Stream not available. Make sure OBS is streaming and try refreshing.');
            setIsLoading(false);
          }
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
