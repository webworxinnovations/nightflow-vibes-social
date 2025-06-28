
import { useMemo } from 'react';

interface UseHlsConfigProps {
  isLive: boolean;
}

export const useHlsConfig = ({ isLive }: UseHlsConfigProps) => {
  const hlsConfig = useMemo(() => ({
    enableWorker: true,
    lowLatencyMode: isLive,
    backBufferLength: isLive ? 4 : 30,
    maxBufferLength: isLive ? 10 : 30,
    maxMaxBufferLength: isLive ? 15 : 60,
    liveSyncDurationCount: isLive ? 1 : 3,
    liveMaxLatencyDurationCount: isLive ? 3 : 10,
    manifestLoadingTimeOut: 10000,
    manifestLoadingMaxRetry: 2,
    manifestLoadingRetryDelay: 2000,
    debug: false
  }), [isLive]);

  return hlsConfig;
};
