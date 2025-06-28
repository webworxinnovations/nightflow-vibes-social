
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
      console.error('🔑 STREAM KEY ISSUE: DigitalOcean droplet server rejected the stream key');
      console.error('💡 This usually means:');
      console.error('   1. DigitalOcean droplet server is not running (check: ssh root@67.205.179.77)');
      console.error('   2. OBS is not streaming to the droplet yet');
      console.error('   3. Stream key doesn\'t match what\'s in OBS');
      console.error('   4. Droplet firewall is blocking connections');
    }
    
    console.groupEnd();
    
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('🌐 Network error connecting to DigitalOcean droplet');
          
          if (data.response?.code === 404) {
            setError('❌ Stream not found on DigitalOcean droplet. Please ensure your droplet server is running and OBS is streaming.');
            setIsLoading(false);
            return;
          }
          
          // Test droplet connectivity but don't spam
          if (Date.now() - lastNetworkTest > 30000) {
            logNetworkRequest(hlsUrl, 'DigitalOcean Droplet HLS Stream');
          }
          
          const canRetry = scheduleRetry(() => {
            console.log(`🔄 Retry attempt ${getCurrentRetryCount()}/${maxRetries} for DigitalOcean droplet connection`);
            attemptLoad();
          }, 15000);

          if (canRetry) {
            setError(`Cannot connect to DigitalOcean droplet - retrying in 15 seconds (${getCurrentRetryCount()}/${maxRetries})`);
          } else {
            setError('❌ Cannot connect to your DigitalOcean droplet server. Check if it\'s running: ssh root@67.205.179.77');
            setIsLoading(false);
          }
          break;
          
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('📺 Media error - attempting recovery');
          setError('Stream format error - trying to recover...');
          break;
          
        default:
          console.error('❌ Fatal HLS error:', data.type, data.details);
          setError(`Stream error: ${data.details}. Check your DigitalOcean droplet server status.`);
          setIsLoading(false);
          break;
      }
    } else {
      console.warn('⚠️ Non-fatal HLS error:', data.type, data.details);
    }
  };

  return { handleHlsError };
};
