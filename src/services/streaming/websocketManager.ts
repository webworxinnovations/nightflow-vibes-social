
import { StreamStatus } from '@/types/streaming';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  connectToStreamStatus(streamKey: string): void {
    if (this.ws) {
      this.ws.close();
    }

    // Connect directly to DigitalOcean droplet WebSocket
    const wsUrl = `ws://67.205.179.77:3001/ws/stream/${streamKey}`;
    console.log('🔌 Connecting to DigitalOcean droplet WebSocket:', wsUrl);
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to DigitalOcean droplet WebSocket for stream status');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const status: StreamStatus = JSON.parse(event.data);
          console.log('📊 Received stream status from droplet:', status);
          this.statusCallbacks.forEach(callback => callback(status));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('🔌 DigitalOcean droplet WebSocket connection closed:', event.code, event.reason);
        this.scheduleReconnect(streamKey);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ DigitalOcean droplet WebSocket error:', error);
        console.error('💡 This means your droplet WebSocket server is not running');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection to droplet:', error);
    }
  }

  private scheduleReconnect(streamKey: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connectToStreamStatus(streamKey);
      }, delay);
    } else {
      console.log('❌ Max WebSocket reconnect attempts reached for DigitalOcean droplet');
    }
  }

  onStatusUpdate(callback: (status: StreamStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.statusCallbacks = [];
    this.reconnectAttempts = 0;
    console.log('🔌 Disconnected from DigitalOcean droplet WebSocket');
  }
}
