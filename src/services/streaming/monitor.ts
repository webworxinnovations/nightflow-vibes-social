import type { StreamStatus } from '@/types/streaming';

export class StreamingMonitor {
  private ws: WebSocket | null = null;
  private statusCallbacks: ((status: StreamStatus) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  connectToStreamStatusWebSocket(streamKey: string) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    // Don't keep trying if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max WebSocket reconnection attempts reached, falling back to polling');
      this.startPolling(streamKey);
      return;
    }

    this.isConnecting = true;
    this.reconnectAttempts++;
    
    try {
      // Use HTTP URL instead of WSS if WebSocket fails
      const baseUrl = 'https://nightflow-vibes-social-production.up.railway.app';
      const wsUrl = `wss://nightflow-vibes-social-production.up.railway.app/ws/stream/${streamKey}`;
      console.log(`Connecting to stream status WebSocket (attempt ${this.reconnectAttempts}):`, wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Stream status WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0; // Reset on successful connection
      };

      this.ws.onmessage = (event) => {
        try {
          const status: StreamStatus = JSON.parse(event.data);
          console.log('Received stream status via WebSocket:', status);
          this.statusCallbacks.forEach(callback => callback(status));
        } catch (error) {
          console.error('Failed to parse stream status:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Stream status WebSocket disconnected');
        this.isConnecting = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(streamKey);
        } else {
          console.log('WebSocket failed, switching to HTTP polling');
          this.startPolling(streamKey);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Stream status WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.startPolling(streamKey);
    }
  }

  private scheduleReconnect(streamKey: string) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Exponential backoff: 5s, 10s, 20s, etc.
    const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect stream status WebSocket (${delay}ms delay)...`);
      this.connectToStreamStatusWebSocket(streamKey);
    }, delay);
  }

  private startPolling(streamKey: string) {
    console.log('Starting HTTP polling for stream status');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`https://nightflow-vibes-social-production.up.railway.app/api/stream/${streamKey}/status`);
        if (response.ok) {
          const status: StreamStatus = await response.json();
          console.log('Received stream status via polling:', status);
          this.statusCallbacks.forEach(callback => callback(status));
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Store the interval so we can clear it later
    this.pollInterval = pollInterval;
  }

  private pollInterval: NodeJS.Timeout | null = null;

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

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.statusCallbacks = [];
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
}
