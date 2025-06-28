
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
  const [lastNetworkTest, setLastNetworkTest] = useState<number>(0);
  
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

  // Throttled network test - only run once every 30 seconds
  const logNetworkRequest = async (url: string, description: string) => {
    const now = Date.now();
    if (now - lastNetworkTest < 30000) { // 30 second throttle
      console.log(`⏸️ Network test throttled for ${description}`);
      return false;
    }
    
    setLastNetworkTest(now);
    console.log(`🌐 Network Test: ${description}`);
    console.log(`🎯 Testing URL: ${url}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      console.log(`✅ ${description} - Response status:`, response.status);
      return true;
    } catch (error) {
      console.error(`❌ ${description} - Network Error:`, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  const handleHlsError = (event: any, data: any) => {
    console.group('🚨 HLS Error Analysis');
    console.error('Error Type:', data.type);
    console.error('Error Details:', data.details);
    console.error('Fatal:', data.fatal);
    console.error('URL:', data.url);
    console.error('Response Code:', data.response?.code);
    
    // Check if this is a stream key validation error
    if (data.response?.code === 404 || data.response?.code === 403) {
      console.error('🔑 STREAM KEY ISSUE: Server rejected the stream key');
      console.error('💡 This usually means:');
      console.error('   1. Stream key format is incorrect (should start with "nf_")');
      console.error('   2. OBS is not streaming yet');
      console.error('   3. Stream key doesn\'t match what\'s in OBS');
    }
    
    console.groupEnd();
    
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('🌐 Network error detected');
          
          // Check if this is a stream key format issue
          if (data.response?.code === 404) {
            setError('❌ Stream not found. Check your stream key format and ensure OBS is streaming.');
            setIsLoading(false);
            return;
          }
          
          // Only test network connectivity if we haven't recently
          if (Date.now() - lastNetworkTest > 30000) {
            logNetworkRequest(hlsUrl, 'HLS Stream Endpoint');
          }
          
          const canRetry = scheduleRetry(() => {
            console.log(`🔄 Retry attempt ${getCurrentRetryCount()}/${maxRetries} for HLS connection`);
            attemptLoad();
          }, 20000); // 20 second delay between retries

          if (canRetry) {
            setError(`Connection failed - retrying in 20 seconds (${getCurrentRetryCount()}/${maxRetries})`);
          } else {
            setError('❌ Stream unavailable. Ensure OBS is streaming with the correct stream key format (nf_...)');
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
          setError(`Stream error: ${data.details}`);
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
    console.log('Attempt:', getCurrentRetryCount() + 1, '/', maxRetries + 1);
    console.log('HLS URL:', hlsUrl);
    console.log('Expected HLS Format: http://67.205.179.77:8888/live/nf_[streamKey]/index.m3u8');
    
    // Validate stream key format
    const streamKeyMatch = hlsUrl.match(/\/live\/([^\/]+)\/index\.m3u8/);
    if (streamKeyMatch) {
      const streamKey = streamKeyMatch[1];
      console.log('Extracted Stream Key:', streamKey);
      if (!streamKey.startsWith('nf_')) {
        console.error('❌ INVALID STREAM KEY FORMAT - Must start with "nf_"');
        setError('❌ Invalid stream key format. Please generate a new stream key.');
        setIsLoading(false);
        return;
      }
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
