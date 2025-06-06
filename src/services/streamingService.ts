
interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl: string;
  isLive: boolean;
  viewerCount: number;
}

interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  resolution: string;
}

class StreamingService {
  private baseUrl: string;
  private websocket: WebSocket | null = null;
  private statusCallbacks: Set<(status: StreamStatus) => void> = new Set();

  constructor() {
    // This would be your actual streaming server URL
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://stream.nightflow.app' 
      : 'ws://localhost:1935';
  }

  async generateStreamKey(): Promise<StreamConfig> {
    const streamKey = `nf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const config: StreamConfig = {
      rtmpUrl: process.env.NODE_ENV === 'production' 
        ? 'rtmp://ingest.nightflow.app/live' 
        : 'rtmp://localhost:1935/live',
      streamKey,
      hlsUrl: process.env.NODE_ENV === 'production'
        ? `https://stream.nightflow.app/live/${streamKey}/index.m3u8`
        : `http://localhost:8080/live/${streamKey}/index.m3u8`,
      isLive: false,
      viewerCount: 0
    };

    // Store the stream config (would typically save to database)
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    return config;
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    try {
      // In production, this would call your streaming server's API
      const response = await fetch(`${this.baseUrl.replace('ws', 'http')}/api/stream/${streamKey}/status`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to get real stream status, using mock data:', error);
    }

    // Fallback to mock data for development
    return {
      isLive: Math.random() > 0.7,
      viewerCount: Math.floor(Math.random() * 50) + 1,
      duration: Math.floor(Math.random() * 3600),
      bitrate: 2500,
      resolution: '1920x1080'
    };
  }

  connectToStreamStatusWebSocket(streamKey: string) {
    if (this.websocket) {
      this.websocket.close();
    }

    try {
      this.websocket = new WebSocket(`${this.baseUrl}/stream/${streamKey}/status`);
      
      this.websocket.onmessage = (event) => {
        const status: StreamStatus = JSON.parse(event.data);
        this.statusCallbacks.forEach(callback => callback(status));
      };

      this.websocket.onerror = (error) => {
        console.warn('WebSocket connection failed, falling back to polling:', error);
        this.startPolling(streamKey);
      };
    } catch (error) {
      console.warn('WebSocket not available, using polling:', error);
      this.startPolling(streamKey);
    }
  }

  private startPolling(streamKey: string) {
    const interval = setInterval(async () => {
      try {
        const status = await this.getStreamStatus(streamKey);
        this.statusCallbacks.forEach(callback => callback(status));
      } catch (error) {
        console.error('Failed to poll stream status:', error);
      }
    }, 5000);

    // Store interval for cleanup
    (this as any).pollingInterval = interval;
  }

  onStatusUpdate(callback: (status: StreamStatus) => void) {
    this.statusCallbacks.add(callback);
    
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if ((this as any).pollingInterval) {
      clearInterval((this as any).pollingInterval);
    }
    
    this.statusCallbacks.clear();
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('ws', 'http')}/api/stream/${streamKey}/validate`);
      return response.ok;
    } catch (error) {
      console.warn('Stream validation failed, assuming valid for development:', error);
      return true; // Assume valid for development
    }
  }
}

export const streamingService = new StreamingService();
export type { StreamConfig, StreamStatus };
