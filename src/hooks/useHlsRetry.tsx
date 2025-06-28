
import { useRef } from 'react';

export const useHlsRetry = (maxRetries: number = 3) => {
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const scheduleRetry = (callback: () => void, delay: number = 10000) => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`⏰ Scheduling retry ${retryCountRef.current}/${maxRetries} in ${delay/1000} seconds`);
      retryTimeoutRef.current = setTimeout(callback, delay);
      return true;
    }
    console.log(`❌ Max retries (${maxRetries}) reached, stopping retry attempts`);
    return false;
  };

  const resetRetryCount = () => {
    retryCountRef.current = 0;
    console.log('🔄 Retry count reset');
  };

  const getCurrentRetryCount = () => retryCountRef.current;

  return {
    clearRetryTimeout,
    scheduleRetry,
    resetRetryCount,
    getCurrentRetryCount,
    maxRetries
  };
};
