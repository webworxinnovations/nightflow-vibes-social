
import { supabase } from '@/lib/supabase'
import type { Stream } from '@/lib/supabase'

interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  hlsUrl: string;
  isLive: boolean;
  viewerCount: number;
}

interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  resolution: string;
}

class StreamingService {
  private baseUrl: string;
  private websocket: WebSocket | null = null;
  private statusCallbacks: Set<(status: StreamStatus) => void> = new Set();

  constructor() {
    // Use environment variables for production, localhost for development
    this.baseUrl = import.meta.env.VITE_STREAMING_SERVER_URL || 
      (import.meta.env.MODE === 'production' 
        ? 'wss://stream.nightflow.app' 
        : 'ws://localhost:3001');
  }

  async generateStreamKey(): Promise<StreamConfig> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to generate a stream key');
    }

    // Generate unique stream key
    const streamKey = `nf_${user.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const rtmpUrl = import.meta.env.VITE_RTMP_URL || 
      (import.meta.env.MODE === 'production' 
        ? 'rtmp://ingest.nightflow.app/live' 
        : 'rtmp://localhost:1935/live');
        
    const hlsUrl = import.meta.env.VITE_HLS_BASE_URL 
      ? `${import.meta.env.VITE_HLS_BASE_URL}/live/${streamKey}/index.m3u8`
      : (import.meta.env.MODE === 'production'
        ? `https://stream.nightflow.app/live/${streamKey}/index.m3u8`
        : `http://localhost:8080/live/${streamKey}/index.m3u8`);

    // Save stream to database
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: user.id,
        stream_key: streamKey,
        rtmp_url: rtmpUrl,
        hls_url: hlsUrl,
        status: 'offline',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save stream to database:', error);
      throw new Error('Failed to generate stream key');
    }

    const config: StreamConfig = {
      rtmpUrl,
      streamKey,
      hlsUrl,
      isLive: false,
      viewerCount: 0
    };

    // Also store in localStorage for backward compatibility
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    return config;
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    // Get active stream from database
    const { data: stream, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !stream) {
      // Fallback to localStorage for existing users
      const saved = localStorage.getItem('nightflow_stream_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
      return null;
    }

    return {
      rtmpUrl: stream.rtmp_url,
      streamKey: stream.stream_key,
      hlsUrl: stream.hls_url,
      isLive: stream.status === 'live',
      viewerCount: stream.viewer_count
    };
  }

  async revokeStreamKey(): Promise<void> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to revoke stream key');
    }

    // Deactivate current stream in database
    const { error } = await supabase
      .from('streams')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to revoke stream in database:', error);
    }

    // Clear localStorage
    localStorage.removeItem('nightflow_stream_config');
    
    // Disconnect websocket
    this.disconnect();
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    try {
      // First try to get from streaming server
      const response = await fetch(`${this.baseUrl.replace('ws', 'http')}/api/stream/${streamKey}/status`);
      
      if (response.ok) {
        const status = await response.json();
        
        // Update database with latest status
        await supabase
          .from('streams')
          .update({
            status: status.isLive ? 'live' : 'offline',
            viewer_count: status.viewerCount,
            duration: status.duration,
            bitrate: status.bitrate,
            resolution: status.resolution,
            updated_at: new Date().toISOString()
          })
          .eq('stream_key', streamKey);
          
        return status;
      }
    } catch (error) {
      console.warn('Failed to get stream status from server:', error);
    }

    // Fallback: get status from database
    const { data: stream } = await supabase
      .from('streams')
      .select('*')
      .eq('stream_key', streamKey)
      .single();

    if (stream) {
      return {
        isLive: stream.status === 'live',
        viewerCount: stream.viewer_count,
        duration: stream.duration,
        bitrate: stream.bitrate,
        resolution: stream.resolution
      };
    }

    // Final fallback: mock data for development
    return {
      isLive: false,
      viewerCount: 0,
      duration: 0,
      bitrate: 0,
      resolution: ''
    };
  }

  connectToStreamStatusWebSocket(streamKey: string) {
    if (this.websocket) {
      this.websocket.close();
    }

    try {
      const wsUrl = `${this.baseUrl}/stream/${streamKey}/status`;
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('Connected to streaming WebSocket');
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const status: StreamStatus = JSON.parse(event.data);
          this.statusCallbacks.forEach(callback => callback(status));
          
          // Update database with real-time status
          supabase
            .from('streams')
            .update({
              status: status.isLive ? 'live' : 'offline',
              viewer_count: status.viewerCount,
              duration: status.duration,
              bitrate: status.bitrate,
              resolution: status.resolution,
              updated_at: new Date().toISOString()
            })
            .eq('stream_key', streamKey)
            .then(({ error }) => {
              if (error) {
                console.warn('Failed to update stream status in database:', error);
              }
            });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.warn('WebSocket connection failed, falling back to polling:', error);
        this.startPolling(streamKey);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.warn('WebSocket not available, using polling:', error);
      this.startPolling(streamKey);
    }
  }

  private startPolling(streamKey: string) {
    const interval = setInterval(async () => {
      try {
        const status = await this.getStreamStatus(streamKey);
        this.statusCallbacks.forEach(callback => callback(status));
      } catch (error) {
        console.error('Failed to poll stream status:', error);
      }
    }, 5000);

    // Store interval for cleanup
    (this as any).pollingInterval = interval;
  }

  onStatusUpdate(callback: (status: StreamStatus) => void) {
    this.statusCallbacks.add(callback);
    
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if ((this as any).pollingInterval) {
      clearInterval((this as any).pollingInterval);
    }
    
    this.statusCallbacks.clear();
  }

  async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      // Check if stream key exists in database
      const { data: stream, error } = await supabase
        .from('streams')
        .select('id')
        .eq('stream_key', streamKey)
        .eq('is_active', true)
        .single();

      if (!error && stream) {
        return true;
      }

      // Fallback: check with streaming server
      const response = await fetch(`${this.baseUrl.replace('ws', 'http')}/api/stream/${streamKey}/validate`);
      return response.ok;
    } catch (error) {
      console.warn('Stream validation failed:', error);
      return false;
    }
  }
}

export const streamingService = new StreamingService();
export type { StreamConfig, StreamStatus };

