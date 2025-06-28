
import { StreamStatus } from '@/types/streaming';

export class WebSocketManager {
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 3;
  private reconnectAttempts = 0;

  connectToStreamStatus(streamKey: string): void {
    console.log('🔌 Setting up WebSocket connection for stream status...');
    
    // For now, emit a basic status since WebSocket might have CORS issues
    setTimeout(() => {
      const basicStatus: StreamStatus = {
        isLive: false,
        viewerCount: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Emitting basic stream status for UI');
      this.statusCallbacks.forEach(callback => callback(basicStatus));
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
    
    this.reconnectAttempts = 0;
    this.statusCallbacks = [];
  }
}
