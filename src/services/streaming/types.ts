
export interface StreamingServiceInterface {
  generateStreamKey(): Promise<import('@/types/streaming').StreamConfig>;
  getCurrentStream(): Promise<import('@/types/streaming').StreamConfig | null>;
  validateStreamKey(streamKey: string): Promise<boolean>;
  revokeStreamKey(): Promise<void>;
  getServerStatus(): Promise<{ available: boolean; url: string; version?: string; uptime?: number }>;
  connectToStreamStatusWebSocket(streamKey: string): void;
  onStatusUpdate(callback: (status: import('@/types/streaming').StreamStatus) => void): () => void;
  disconnect(): void;
}

export interface ServerStatusResponse {
  available: boolean;
  url: string;
  version?: string;
  uptime?: number;
}
