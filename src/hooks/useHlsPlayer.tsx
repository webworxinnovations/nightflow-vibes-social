
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

  const logNetworkRequest = async (url: string, description: string) => {
    console.log(`🌐 Network Test: ${description}`);
    console.log(`🎯 Testing URL: ${url}`);
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log(`✅ ${description} - Response status:`, response.status);
      return true;
    } catch (error) {
      console.error(`❌ ${description} - Network Error:`, error);
      console.error(`❌ Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        url: url
      });
      return false;
    }
  };

  const handleHlsError = (event: any, data: any) => {
    // Enhanced error logging
    console.group('🚨 HLS Error Analysis');
    console.error('Error Type:', data.type);
    console.error('Error Details:', data.details);
    console.error('Fatal:', data.fatal);
    console.error('URL:', data.url);
    console.error('Response Code:', data.response?.code);
    console.error('Response Text:', data.response?.text);
    console.error('Network Info:', {
      online: navigator.onLine,
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    });
    console.groupEnd();
    
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('🌐 Network error detected - analyzing...');
          
          // Test server connectivity
          logNetworkRequest(hlsUrl, 'HLS Stream Endpoint');
          logNetworkRequest('http://67.205.179.77:8888/health', 'HLS Server Health Check');
          logNetworkRequest('http://67.205.179.77:3001/health', 'API Server Health Check');
          
          const canRetry = scheduleRetry(() => {
            console.log(`🔄 Retry attempt ${getCurrentRetryCount()}/${maxRetries} for HLS connection`);
            attemptLoad();
          }, 10000); // Longer delay for network issues

          if (canRetry) {
            setError(`Network error - retrying (${getCurrentRetryCount()}/${maxRetries}). Check console for details.`);
          } else {
            setError('❌ Connection failed after multiple attempts. Server may be offline.');
            setIsLoading(false);
          }
          break;
          
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('📺 Media error - attempting recovery');
          setError('Media format error - trying to recover...');
          try {
            hlsRef.current?.recoverMediaError();
          } catch (err) {
            console.error('Media recovery failed:', err);
            setError('Failed to recover from media error');
            setIsLoading(false);
          }
          break;
          
        default:
          console.error('❌ Fatal HLS error:', data.type, data.details);
          setError(`Stream error: ${data.details} (Type: ${data.type})`);
          setIsLoading(false);
          break;
      }
    } else {
      console.warn('⚠️ Non-fatal HLS error:', data.type, data.details);
    }
  };

  const attemptLoad = async () => {
    const video = videoRef.current;
    if (!video || !hlsUrl) {
      console.log('🎥 No video element or HLS URL provided');
      setIsLoading(false);
      return;
    }

    console.group('🎬 HLS Connection Attempt');
    console.log('Attempt:', getCurrentRetryCount() + 1, '/', maxRetries);
    console.log('HLS URL:', hlsUrl);
    console.log('Browser Info:', {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    });
    
    // Test basic connectivity first
    const connectivityOk = await logNetworkRequest(hlsUrl, 'Direct HLS URL Test');
    if (!connectivityOk) {
      console.warn('⚠️ Direct connectivity test failed, but continuing with HLS attempt...');
    }
    
    console.groupEnd();

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
        console.log('✅ Stream ready for playback');
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

      // Additional event logging
      hls.on(Hls.Events.MANIFEST_LOADING, () => {
        console.log('📥 Loading HLS manifest...');
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log('📊 Quality level loaded:', data.level, 'segments:', data.details.fragments.length);
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
        console.error('Video error details:', {
          code: video.error?.code,
          message: video.error?.message,
          MEDIA_ERR_ABORTED: video.error?.code === 1,
          MEDIA_ERR_NETWORK: video.error?.code === 2,
          MEDIA_ERR_DECODE: video.error?.code === 3,
          MEDIA_ERR_SRC_NOT_SUPPORTED: video.error?.code === 4
        });
        
        const canRetry = scheduleRetry(() => {
          attemptLoad();
        }, 8000);

        if (canRetry) {
          setError(`Native playback error (${getCurrentRetryCount()}/${maxRetries}). Retrying...`);
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
