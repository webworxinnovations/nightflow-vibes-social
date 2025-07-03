import { StreamConfig, StreamStatus } from '@/types/streaming';

class StreamingService {
  private static instance: StreamingService;
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private pollingInterval: number | null = null;

  // Updated to use HTTP port 8888 (matching your actual server)
  private readonly API_BASE_URL = 'http://67.205.179.77:8888';
  private readonly RTMP_URL = 'rtmp://67.205.179.77:1935/live';

  private constructor() {}

  static getInstance(): StreamingService {
    if (!StreamingService.instance) {
      StreamingService.instance = new StreamingService();
    }
    return StreamingService.instance;
  }

  async generateStreamKey(): Promise<StreamConfig> {
    const streamKey = `nf_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    console.log('🔑 Generating stream key with HTTP on port 8888...');
    
    const config: StreamConfig = {
      streamKey,
      rtmpUrl: this.RTMP_URL,
      hlsUrl: `${this.API_BASE_URL}/live/${streamKey}/index.m3u8`
    };

    // Store in localStorage
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    console.log('✅ Stream config generated with HTTP:', config);
    return config;
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    try {
      const stored = localStorage.getItem('nightflow_stream_config');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load stored config:', error);
    }
    return null;
  }

  async getServerStatus(): Promise<{ available: boolean; url: string; error?: string }> {
    console.log('🔍 Testing HTTP server at 67.205.179.77:8888...');
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      const available = response.ok;
      console.log(available ? '✅ HTTP Server online!' : '⚠️ HTTP Server issues');
      
      return {
        available,
        url: this.API_BASE_URL,
        error: available ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Connection failed';
      console.error('❌ HTTP Server connection failed:', errorMsg);
      
      return {
        available: false,
        url: this.API_BASE_URL,
        error: errorMsg
      };
    }
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    // For now, just return true since we can't validate without server
    console.log('🔑 Stream key validation (offline mode):', streamKey);
    return true;
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    // Return default status since server is not accessible
    return {
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: '',
      timestamp: new Date().toISOString()
    };
  }

  async revokeStreamKey(): Promise<void> {
    localStorage.removeItem('nightflow_stream_config');
    this.stopPolling();
    console.log('🔑 Stream key revoked');
  }

  onStatusUpdate(callback: (status: StreamStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  connectToStreamStatusWebSocket(streamKey: string): void {
    this.startPolling(streamKey);
  }

  private startPolling(streamKey: string): void {
    this.stopPolling();
    
    this.pollingInterval = window.setInterval(async () => {
      const status = await this.getStreamStatus(streamKey);
      this.statusCallbacks.forEach(callback => callback(status));
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  disconnect(): void {
    this.stopPolling();
  }
}

export const streamingService = StreamingService.getInstance();
