
import { StreamingConfig } from './streaming/config';

class StreamingService {
  private wsConnection: WebSocket | null = null;
  private statusCallback: ((status: any) => void) | null = null;

  async generateStreamKey(): Promise<{ streamKey: string; rtmpUrl: string; hlsUrl: string }> {
    const streamKey = `nf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔑 Generated stream key for your droplet:', streamKey);
    
    const config = {
      streamKey,
      rtmpUrl: StreamingConfig.getOBSServerUrl(),
      hlsUrl: StreamingConfig.getHLSUrl(streamKey)
    };

    console.log('📡 Stream configuration:');
    console.log('- RTMP URL (for OBS):', config.rtmpUrl);
    console.log('- HLS URL (for playback):', config.hlsUrl);
    console.log('- Stream Key:', streamKey);

    // Store in localStorage for persistence
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    return config;
  }

  async getCurrentStream(): Promise<{ streamKey: string; rtmpUrl: string; hlsUrl: string } | null> {
    const stored = localStorage.getItem('nightflow_stream_config');
    if (stored) {
      const config = JSON.parse(stored);
      console.log('✅ Current stream loaded:', config);
      return config;
    }
    return null;
  }

  async revokeStreamKey(): Promise<void> {
    localStorage.removeItem('nightflow_stream_config');
    this.disconnect();
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    if (!streamKey.startsWith('nf_')) {
      return false;
    }
    
    console.log('✅ Stream key format validated');
    return true;
  }

  async getServerStatus(): Promise<{ available: boolean; url: string }> {
    console.log('🔍 Checking your droplet server status...');
    
    try {
      const result = await StreamingConfig.testDropletConnection();
      console.log(result.available ? '✅ Droplet is online!' : '❌ Droplet is offline');
      
      return {
        available: result.available,
        url: StreamingConfig.getServerBaseUrl()
      };
    } catch (error) {
      console.error('❌ Droplet test failed:', error);
      return {
        available: false,
        url: StreamingConfig.getServerBaseUrl()
      };
    }
  }

  connectToStreamStatusWebSocket(streamKey: string): void {
    console.log('🔌 Attempting WebSocket connection to your droplet...');
    
    try {
      const wsUrl = StreamingConfig.getWebSocketUrl(streamKey);
      console.log('WebSocket URL:', wsUrl);
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('✅ WebSocket connected to your droplet');
      };
      
      this.wsConnection.onmessage = (event) => {
        const status = JSON.parse(event.data);
        this.statusCallback?.(status);
      };
      
      this.wsConnection.onerror = (error) => {
        console.warn('⚠️ WebSocket connection failed - using fallback');
        this.fallbackToPolling(streamKey);
      };
      
    } catch (error) {
      console.warn('⚠️ WebSocket blocked - using fallback');
      this.fallbackToPolling(streamKey);
    }
  }

  private fallbackToPolling(streamKey: string): void {
    console.log('📡 Using fallback polling for stream status');
    
    // Poll the server for stream status
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${StreamingConfig.getApiBaseUrl()}/api/stream/${streamKey}/status`);
        if (response.ok) {
          const status = await response.json();
          console.log('📊 Stream status update:', status);
          this.statusCallback?.(status);
        }
      } catch (error) {
        console.warn('Polling failed:', error);
        // Simulate offline status
        if (this.statusCallback) {
          this.statusCallback({
            isLive: false,
            viewerCount: 0,
            duration: 0,
            bitrate: 0,
            resolution: '',
            timestamp: new Date().toISOString()
          });
        }
      }
    }, 5000);

    // Store interval ID to clear it later
    this.pollInterval = pollInterval;
  }

  private pollInterval: NodeJS.Timeout | null = null;

  onStatusUpdate(callback: (status: any) => void): () => void {
    this.statusCallback = callback;
    return () => {
      this.statusCallback = null;
    };
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

export const streamingService = new StreamingService();
