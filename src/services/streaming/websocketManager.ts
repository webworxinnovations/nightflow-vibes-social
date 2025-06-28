
import { StreamStatus } from '@/types/streaming';

export class WebSocketManager {
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private statusInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 3;
  private reconnectAttempts = 0;

  connectToStreamStatus(streamKey: string): void {
    console.log('🔌 Connecting to DigitalOcean WebSocket for stream status...');
    
    // Try to connect to the actual WebSocket server
    const wsUrl = `wss://nightflow-app-wijb2.ondigitalocean.app/ws/stream/${streamKey}`;
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('✅ Connected to DigitalOcean WebSocket');
        this.reconnectAttempts = 0;
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const status = JSON.parse(event.data) as StreamStatus;
          console.log('📊 Received stream status:', status);
          this.statusCallbacks.forEach(callback => callback(status));
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };
      
      this.websocket.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.handleReconnect(streamKey);
      };
      
      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.handleReconnect(streamKey);
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.fallbackToPolling(streamKey);
    }
  }

  private handleReconnect(streamKey: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectToStreamStatus(streamKey);
      }, 3000 * this.reconnectAttempts);
    } else {
      console.log('❌ Max reconnection attempts reached, falling back to polling');
      this.fallbackToPolling(streamKey);
    }
  }

  private fallbackToPolling(streamKey: string): void {
    console.log('📡 Using polling fallback for stream status');
    
    // Clear any existing interval
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    
    // Poll the stream status every 10 seconds
    this.statusInterval = setInterval(async () => {
      try {
        const response = await fetch(`https://nightflow-app-wijb2.ondigitalocean.app/api/stream/${streamKey}/status`);
        if (response.ok) {
          const status = await response.json() as StreamStatus;
          this.statusCallbacks.forEach(callback => callback(status));
        } else {
          // Stream not found, emit offline status
          const offlineStatus: StreamStatus = {
            isLive: false,
            viewerCount: 0,
            duration: 0,
            bitrate: 0,
            resolution: '',
            timestamp: new Date().toISOString()
          };
          this.statusCallbacks.forEach(callback => callback(offlineStatus));
        }
      } catch (error) {
        console.error('❌ Failed to poll stream status:', error);
        // Emit offline status on error
        const offlineStatus: StreamStatus = {
          isLive: false,
          viewerCount: 0,
          duration: 0,
          bitrate: 0,
          resolution: '',
          timestamp: new Date().toISOString()
        };
        this.statusCallbacks.forEach(callback => callback(offlineStatus));
      }
    }, 10000);
    
    // Initial status check
    setTimeout(() => {
      const initialStatus: StreamStatus = {
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      };
      this.statusCallbacks.forEach(callback => callback(initialStatus));
    }, 1000);
  }

  onStatusUpdate(callback: (status: StreamStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect(): void {
    console.log('🔌 WebSocket manager disconnected');
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    
    this.reconnectAttempts = 0;
    this.statusCallbacks = [];
  }
}
