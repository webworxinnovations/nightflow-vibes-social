
export interface StreamConfig {
  streamKey: string;
  rtmpUrl: string;
  hlsUrl: string;
  createdAt: string;
}

export interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  resolution: string;
  timestamp: string;
}

export interface ServerStatusResponse {
  available: boolean;
  url: string;
  version?: string;
  uptime?: number;
  error?: string;
}
