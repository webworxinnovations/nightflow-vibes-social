
import { StreamConfig, StreamStatus } from '@/types/streaming';

class StreamingService {
  private static instance: StreamingService;
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private pollingInterval: number | null = null;

  // MUST use HTTPS for Lovable compatibility
  private readonly API_BASE_URL = 'https://67.205.179.77:3443';
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
    
    console.log('🔑 Generating stream key with HTTPS SSL for Lovable...');
    
    const config: StreamConfig = {
      streamKey,
      rtmpUrl: this.RTMP_URL,
      hlsUrl: `https://67.205.179.77:3443/live/${streamKey}/index.m3u8` // HTTPS required for Lovable
    };

    // Store in localStorage
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    console.log('✅ Stream config generated with HTTPS SSL:', config);
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
    console.log('🔍 Testing HTTPS droplet server connectivity...');
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(8000),
        mode: 'cors'
      });
      
      if (response.ok) {
        console.log('✅ Droplet HTTPS server is online and responding!');
        return {
          available: true,
          url: this.API_BASE_URL,
          error: undefined
        };
      } else {
        console.error('❌ Server responded with error:', response.status);
        return {
          available: false,
          url: this.API_BASE_URL,
          error: `Server error: ${response.status}`
        };
      }
    } catch (error) {
      console.error('❌ Failed to connect to droplet server:', error);
      return {
        available: false,
        url: this.API_BASE_URL,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    console.log('🔑 Validating stream key with server:', streamKey);
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/validate/${streamKey}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
        mode: 'cors'
      });
      
      const isValid = response.ok;
      console.log('🔑 Stream key validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Stream key validation failed:', error);
      return false;
    }
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    console.log('🔍 Checking live stream status for key:', streamKey);
    
    try {
      const hlsUrl = `https://67.205.179.77:3443/live/${streamKey}/index.m3u8`;
      console.log('🎯 Testing HLS stream at:', hlsUrl);
      
      // Try to fetch the HLS manifest to check if stream is live
      const response = await fetch(hlsUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        mode: 'cors'
      });
      
      const isLive = response.ok && response.status === 200;
      
      if (isLive) {
        console.log('🔴 STREAM IS LIVE! HLS manifest found');
      } else {
        console.log('⚫ Stream offline - HLS manifest not found');
        console.log('- Response status:', response.status);
        console.log('- Make sure OBS is streaming to: rtmp://67.205.179.77:1935/live');
        console.log('- Stream key:', streamKey);
      }
      
      return {
        isLive,
        viewerCount: isLive ? 1 : 0,
        duration: 0,
        bitrate: isLive ? 2500 : 0,
        resolution: isLive ? '1920x1080' : '',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Stream status check failed:', error);
      console.log('💡 Debug info:');
      console.log('- Droplet IP: 67.205.179.77');
      console.log('- HTTPS Port: 3443');
      console.log('- RTMP Port: 1935');
      console.log('- Stream Key:', streamKey);
      
      return {
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      };
    }
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
