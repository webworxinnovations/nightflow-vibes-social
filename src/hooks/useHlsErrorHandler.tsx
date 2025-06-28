
import { useState } from 'react';
import Hls from 'hls.js';

interface UseHlsErrorHandlerProps {
  hlsUrl: string;
  scheduleRetry: (callback: () => void, delay?: number) => boolean;
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
  const [lastNetworkTest, setLastNetworkTest] = useState<number>(0);

  const logNetworkRequest = async (url: string, description: string) => {
    const now = Date.now();
    if (now - lastNetworkTest < 30000) {
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
      return response.ok;
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
          
          if (data.response?.code === 404) {
            setError('❌ Stream not found. Please generate a NEW stream key and start OBS streaming.');
            setIsLoading(false);
            return;
          }
          
          // Test network connectivity but don't spam
          if (Date.now() - lastNetworkTest > 30000) {
            logNetworkRequest(hlsUrl, 'HLS Stream Endpoint');
          }
          
          const canRetry = scheduleRetry(() => {
            console.log(`🔄 Retry attempt ${getCurrentRetryCount()}/${maxRetries} for HLS connection`);
            attemptLoad();
          }, 15000);

          if (canRetry) {
            setError(`Connection failed - retrying in 15 seconds (${getCurrentRetryCount()}/${maxRetries})`);
          } else {
            setError('❌ Stream unavailable. Generate a NEW stream key and ensure OBS is streaming.');
            setIsLoading(false);
          }
          break;
          
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('📺 Media error - attempting recovery');
          setError('Media format error - trying to recover...');
          break;
          
        default:
          console.error('❌ Fatal HLS error:', data.type, data.details);
          setError(`Stream error: ${data.details}. Try generating a new stream key.`);
          setIsLoading(false);
          break;
      }
    } else {
      console.warn('⚠️ Non-fatal HLS error:', data.type, data.details);
    }
  };

  return { handleHlsError };
};
