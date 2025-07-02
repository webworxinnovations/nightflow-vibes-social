import { StreamConfig, StreamStatus } from '@/types/streaming';
import { v4 as uuidv4 } from 'uuid';

class StreamingService {
  private static instance: StreamingService;
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private pollingInterval: number | null = null;

  // Use the correct droplet server URL on port 8888
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
    
    console.log('🔑 Generating stream key for DigitalOcean droplet...');
    
    const config: StreamConfig = {
      streamKey,
      rtmpUrl: this.RTMP_URL,
      hlsUrl: `${this.API_BASE_URL}/live/${streamKey}/index.m3u8`,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage for persistence
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    console.log('✅ Stream config generated:', config);
    return config;
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    try {
      const stored = localStorage.getItem('nightflow_stream_config');
      if (stored) {
        const config = JSON.parse(stored);
        console.log('📝 Loaded stored stream config:', config);
        return config;
      }
    } catch (error) {
      console.error('Failed to load stored config:', error);
    }
    return null;
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      console.log('🔍 Validating stream key with droplet server...');
      const response = await fetch(`${this.API_BASE_URL}/api/stream/${streamKey}/validate`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      
      const isValid = response.ok;
      console.log('🔑 Stream key validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Stream key validation failed:', error);
      return false; // Assume valid if server is unreachable
    }
  }

  async getServerStatus(): Promise<{ available: boolean; url: string }> {
    try {
      console.log('🔍 Checking droplet server status on port 8888...');
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(8000)
      });
      
      const available = response.ok;
      console.log(available ? '✅ Droplet server is online!' : '⚠️ Droplet server issues detected');
      
      return {
        available,
        url: this.API_BASE_URL
      };
    } catch (error) {
      console.error('❌ Failed to connect to droplet server:', error);
      return {
        available: false,
        url: this.API_BASE_URL
      };
    }
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/stream/${streamKey}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          isLive: data.isLive || false,
          viewerCount: data.viewerCount || 0,
          duration: data.duration || 0,
          bitrate: data.bitrate || 0,
          resolution: data.resolution || '',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Polling failed:', error);
    }
    
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
    // Start polling for status updates
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
