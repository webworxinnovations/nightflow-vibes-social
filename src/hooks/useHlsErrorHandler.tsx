
import { useCallback } from 'react';
import Hls from 'hls.js';

interface UseHlsErrorHandlerProps {
  hlsUrl: string;
  scheduleRetry: (callback: () => void, delay: number) => boolean;
  getCurrentRetryCount: () => number;
  maxRetries: number;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  attemptLoad: () => void;
}

export const useHlsErrorHandler = ({
  hlsUrl,
  scheduleRetry,
  getCurrentRetryCount,
  maxRetries,
  setError,
  setIsLoading,
  attemptLoad
}: UseHlsErrorHandlerProps) => {
  
  const handleHlsError = useCallback((event: any, data: any) => {
    console.error('🚨 HLS Error Details:', {
      type: data.type,
      details: data.details,
      fatal: data.fatal,
      url: hlsUrl,
      response: data.response
    });

    // Check for mixed content issues
    const isMixedContentError = 
      data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
      data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
      (data.response && data.response.code === 0);

    if (isMixedContentError) {
      console.error('🔒 Mixed Content Error Detected!');
      console.error('Your HTTPS page cannot load HTTP content from your droplet');
      console.error('Solutions:');
      console.error('    1. Access your app via HTTP instead of HTTPS');
      console.error('    2. Enable HTTPS on your DigitalOcean droplet');
      console.error('    3. Use a proxy to serve HTTPS content');
      console.error('🌐 Network error connecting to DigitalOcean droplet');
      
      setError(
        '🔒 Mixed Content Error: Your HTTPS page cannot load HTTP streams from your droplet. ' +
        'This is a browser security feature. Solutions: 1) Access your app via HTTP, or 2) Enable HTTPS on your droplet server.'
      );
      setIsLoading(false);
      return;
    }

    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('💥 Fatal network error - attempting recovery...');
          
          const canRetry = scheduleRetry(() => {
            console.log('🔄 Retrying HLS connection...');
            attemptLoad();
          }, 15000);

          if (canRetry) {
            setError(`Network error (${getCurrentRetryCount()}/${maxRetries}). Retrying in 15 seconds...`);
          } else {
            setError('Stream unavailable. Please check your droplet server and generate a new stream key.');
            setIsLoading(false);
          }
          break;

        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('💥 Fatal media error - attempting recovery...');
          try {
            // Try to recover from media error
            const hls = event.target as Hls;
            hls.recoverMediaError();
          } catch (err) {
            console.error('❌ Media error recovery failed:', err);
            setError('Media playback error. Try generating a new stream key.');
            setIsLoading(false);
          }
          break;

        default:
          console.error('💥 Fatal HLS error - cannot recover');
          setError('Stream playback failed. Please try generating a new stream key.');
          setIsLoading(false);
          break;
      }
    } else {
      console.warn('⚠️ Non-fatal HLS error - continuing playback');
    }
  }, [hlsUrl, scheduleRetry, getCurrentRetryCount, maxRetries, setError, setIsLoading, attemptLoad]);

  return { handleHlsError };
};
