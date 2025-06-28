
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

  const scheduleRetry = (callback: () => void, delay: number = 5000) => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      retryTimeoutRef.current = setTimeout(callback, delay);
      return true;
    }
    return false;
  };

  const resetRetryCount = () => {
    retryCountRef.current = 0;
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
