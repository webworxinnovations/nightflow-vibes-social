
export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl: string;
  isLive?: boolean;
  viewerCount?: number;
}

export interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  resolution: string;
  timestamp: string;
}
