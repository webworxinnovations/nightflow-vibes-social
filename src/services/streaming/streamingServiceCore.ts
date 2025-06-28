
import { StreamConfig, StreamStatus, ServerStatusResponse } from './types';
import { URLGenerator } from './core/urlGenerator';
import { ServerStatusChecker } from './serverStatusChecker';

export class StreamingServiceCore {
  private statusUpdateCallback: ((status: StreamStatus) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  async generateStreamKey(): Promise<StreamConfig> {
    try {
      console.log('🔑 Generating stream key with DigitalOcean app...');
      
      const streamKey = `nf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const rtmpUrl = URLGenerator.getRtmpUrl();
      const hlsUrl = URLGenerator.getHlsUrl(streamKey);
      
      console.log('✅ Stream configuration generated:');
      console.log('- Stream Key:', streamKey);
      console.log('- RTMP URL:', rtmpUrl);
      console.log('- HLS URL:', hlsUrl);
      console.log('- Using DigitalOcean app for all URLs');
      
      const config: StreamConfig = {
        streamKey,
        rtmpUrl,
        hlsUrl,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage for persistence
      localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
      
      return config;
    } catch (error) {
      console.error('❌ Failed to generate stream key:', error);
      throw new Error('Failed to generate stream key');
    }
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    try {
      const stored = localStorage.getItem('nightflow_stream_config');
      if (stored) {
        const config = JSON.parse(stored);
        console.log('📱 Loaded stream config from storage:', config);
        return config;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load current stream:', error);
      return null;
    }
  }

  async revokeStreamKey(): Promise<void> {
    try {
      localStorage.removeItem('nightflow_stream_config');
      console.log('🗑️ Stream key revoked');
    } catch (error) {
      console.error('❌ Failed to revoke stream key:', error);
      throw new Error('Failed to revoke stream key');
    }
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    if (!streamKey || !streamKey.startsWith('nf_')) {
      console.log('❌ Invalid stream key format');
      return false;
    }
    
    console.log('✅ Stream key validation passed:', streamKey);
    return true;
  }

  async getServerStatus(): Promise<ServerStatusResponse> {
    return ServerStatusChecker.checkStatus();
  }

  connectToStreamStatusWebSocket(streamKey: string): void {
    console.log('🔌 Setting up WebSocket connection for stream status');
    
    // Simulate stream status updates
    const simulateStatus = () => {
      const status: StreamStatus = {
        isLive: Math.random() > 0.7, // Randomly simulate live status
        viewerCount: Math.floor(Math.random() * 50),
        duration: Math.floor(Math.random() * 3600),
        bitrate: 2500 + Math.floor(Math.random() * 1000),
        resolution: '1920x1080',
        timestamp: new Date().toISOString()
      };
      
      if (this.statusUpdateCallback) {
        this.statusUpdateCallback(status);
      }
    };

    // Update status every 10 seconds
    setInterval(simulateStatus, 10000);
    
    // Initial status
    setTimeout(simulateStatus, 1000);
  }

  onStatusUpdate(callback: (status: StreamStatus) => void): () => void {
    this.statusUpdateCallback = callback;
    
    return () => {
      this.statusUpdateCallback = null;
    };
  }

  disconnect(): void {
    console.log('🔌 Disconnecting from streaming service');
    this.statusUpdateCallback = null;
    this.reconnectAttempts = 0;
  }
}
