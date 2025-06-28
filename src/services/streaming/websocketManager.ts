
import { StreamStatus } from '@/types/streaming';

export class WebSocketManager {
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private statusInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 2; // Reduced attempts
  private reconnectAttempts = 0;
  private currentStreamKey: string | null = null;

  connectToStreamStatus(streamKey: string): void {
    console.log('🔌 Attempting WebSocket connection to DigitalOcean Droplet...');
    this.currentStreamKey = streamKey;
    
    const wsUrl = `ws://67.205.179.77:3001/ws/stream/${streamKey}`;
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('✅ Connected to DigitalOcean Droplet WebSocket');
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
        this.handleReconnect();
      };
      
      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.handleReconnect();
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.fallbackToPolling();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.currentStreamKey) {
          this.connectToStreamStatus(this.currentStreamKey);
        }
      }, 5000 * this.reconnectAttempts);
    } else {
      console.log('❌ Max WebSocket reconnection attempts reached, using polling fallback');
      this.fallbackToPolling();
    }
  }

  private fallbackToPolling(): void {
    console.log('📡 Using polling fallback for stream status (server may be offline)');
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    
    // Send offline status immediately
    const offlineStatus: StreamStatus = {
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: '',
      timestamp: new Date().toISOString()
    };
    
    this.statusCallbacks.forEach(callback => callback(offlineStatus));
    
    // Poll less frequently to avoid spam
    this.statusInterval = setInterval(async () => {
      if (!this.currentStreamKey) return;
      
      try {
        const response = await fetch(`http://67.205.179.77:3001/api/stream/${this.currentStreamKey}/status`, {
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const status = await response.json() as StreamStatus;
          this.statusCallbacks.forEach(callback => callback(status));
        } else {
          this.statusCallbacks.forEach(callback => callback(offlineStatus));
        }
      } catch (error) {
        // Server is offline, send offline status
        this.statusCallbacks.forEach(callback => callback(offlineStatus));
      }
    }, 15000); // Poll every 15 seconds instead of 10
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
    this.currentStreamKey = null;
    this.statusCallbacks = [];
  }
}
