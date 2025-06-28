import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { URLGenerator } from '@/services/streaming/core/urlGenerator';

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
  const currentUrlIndexRef = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    setError(null);
    setIsLoading(true);
    retryCountRef.current = 0;
    currentUrlIndexRef.current = 0;

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

    console.log('🎥 HLS Player Debug:');
    console.log('- Primary HLS URL:', hlsUrl);
    console.log('- Is Live:', isLive);
    console.log('- Video element ready:', !!video);

    // Get alternative URLs for fallback
    const streamKey = hlsUrl.match(/live\/([^\/]+)\//)?.[1];
    const alternativeUrls = streamKey ? URLGenerator.getAlternativeHlsUrls(streamKey) : [hlsUrl];
    
    console.log('- Alternative URLs available:', alternativeUrls);

    const attemptLoad = (urlIndex = 0) => {
      const currentUrl = urlIndex === 0 ? hlsUrl : alternativeUrls[urlIndex - 1];
      
      console.log(`🔄 HLS Connection attempt ${retryCountRef.current + 1}/${maxRetries}`);
      console.log(`🎯 Trying URL ${urlIndex + 1}:`, currentUrl);
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: isLive,
          backBufferLength: isLive ? 2 : 30,
          maxBufferLength: isLive ? 8 : 30,
          maxMaxBufferLength: isLive ? 12 : 60,
          liveSyncDurationCount: isLive ? 1 : 3,
          liveMaxLatencyDurationCount: isLive ? 2 : 10,
          // More aggressive timeout settings
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 1,
          manifestLoadingRetryDelay: 1000,
          // Add debug logging
          debug: false
        });

        hlsRef.current = hls;

        hls.loadSource(currentUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest loaded successfully!');
          console.log('✅ Stream is ready for playback');
          setIsLoading(false);
          setError(null);
          retryCountRef.current = 0;
          currentUrlIndexRef.current = 0;
          
          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
              setError('Click to play - autoplay blocked by browser');
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS Error Details:');
          console.error('- Type:', data.type);
          console.error('- Details:', data.details);
          console.error('- Fatal:', data.fatal);
          console.error('- URL:', data.url);
          console.error('- Response:', data.response);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('🌐 Network error details:');
                console.error('- Status:', data.response?.code);
                console.error('- URL that failed:', data.url);
                
                // Try next URL if available
                if (currentUrlIndexRef.current < alternativeUrls.length) {
                  currentUrlIndexRef.current++;
                  console.log(`🔄 Trying alternative URL ${currentUrlIndexRef.current + 1}...`);
                  setError(`Trying alternative connection method ${currentUrlIndexRef.current + 1}...`);
                  
                  // Small delay before trying next URL
                  retryTimeoutRef.current = setTimeout(() => {
                    attemptLoad(currentUrlIndexRef.current);
                  }, 2000);
                  
                } else if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  currentUrlIndexRef.current = 0; // Reset to first URL
                  const retryDelay = 3000;
                  
                  setError(`Connection failed. Retrying (${retryCountRef.current}/${maxRetries})...`);
                  
                  retryTimeoutRef.current = setTimeout(() => {
                    console.log(`🔄 Retrying all URLs (${retryCountRef.current}/${maxRetries})...`);
                    attemptLoad(0);
                  }, retryDelay);
                } else {
                  console.error('❌ All HLS connection attempts failed');
                  setError('Stream not available. Please check: 1) OBS is streaming, 2) Wait 60 seconds after starting OBS, 3) Server is running on port 8888');
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
                setError(`Stream error: ${data.details}`);
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

        hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
          console.log('📊 Stream level loaded:');
          console.log('- Level:', data.level);
          console.log('- Details:', data.details);
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        console.log('🍎 Using Safari native HLS support');
        video.src = currentUrl;
        
        video.addEventListener('loadedmetadata', () => {
          console.log('✅ Native HLS loaded successfully');
          setIsLoading(false);
          setError(null);
          retryCountRef.current = 0;
          currentUrlIndexRef.current = 0;
          
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
          
          // Try alternative URLs for Safari too
          if (currentUrlIndexRef.current < alternativeUrls.length) {
            currentUrlIndexRef.current++;
            setError(`Trying alternative connection ${currentUrlIndexRef.current + 1}...`);
            attemptLoad(currentUrlIndexRef.current);
          } else if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            currentUrlIndexRef.current = 0;
            setError(`Native HLS attempt ${retryCountRef.current}/${maxRetries} failed. Retrying...`);
            
            retryTimeoutRef.current = setTimeout(() => {
              attemptLoad(0);
            }, 3000);
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
