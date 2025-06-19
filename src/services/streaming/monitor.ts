
import { StreamingAPI } from './api';
import type { StreamStatus } from '@/types/streaming';

export class StreamingMonitor {
  private statusCallbacks: Set<(status: StreamStatus) => void> = new Set();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  connectToStreamStatusWebSocket(streamKey: string) {
    // Skip WebSocket for now since server doesn't support it
    console.log('WebSocket connection skipped, using polling instead');
    this.startPolling(streamKey);
  }

  private startPolling(streamKey: string) {
    const interval = setInterval(async () => {
      try {
        const status = await StreamingAPI.getStreamStatus(streamKey);
        this.statusCallbacks.forEach(callback => callback(status));
      } catch (error) {
        console.error('Failed to poll stream status:', error);
      }
    }, 5000);

    this.pollingInterval = interval;
  }

  onStatusUpdate(callback: (status: StreamStatus) => void) {
    this.statusCallbacks.add(callback);
    
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.statusCallbacks.clear();
  }
}
