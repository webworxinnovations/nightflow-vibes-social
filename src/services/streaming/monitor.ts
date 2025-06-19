
import type { StreamStatus } from '@/types/streaming';

export class StreamingMonitor {
  private ws: WebSocket | null = null;
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connectToStreamStatusWebSocket(streamKey: string) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    
    try {
      // Use the same domain as the streaming server
      const wsUrl = `wss://nodejs-production-aa37f.up.railway.app/ws/stream/${streamKey}`;
      console.log('Connecting to stream status WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Stream status WebSocket connected');
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const status: StreamStatus = JSON.parse(event.data);
          console.log('Received stream status:', status);
          this.statusCallbacks.forEach(callback => callback(status));
        } catch (error) {
          console.error('Failed to parse stream status:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Stream status WebSocket disconnected');
        this.isConnecting = false;
        this.scheduleReconnect(streamKey);
      };

      this.ws.onerror = (error) => {
        console.error('Stream status WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(streamKey: string) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect stream status WebSocket...');
      this.connectToStreamStatusWebSocket(streamKey);
    }, 5000);
  }

  onStatusUpdate(callback: (status: StreamStatus) => void) {
    this.statusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.statusCallbacks = [];
    this.isConnecting = false;
  }
}
