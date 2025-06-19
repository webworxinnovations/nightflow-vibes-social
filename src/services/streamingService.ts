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
    // Use production URLs for deployed app, localhost for development
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    console.log('StreamingService: Environment detection:', {
      hostname: window.location.hostname,
      isProduction
    });
    
    if (isProduction) {
      this.baseUrl = 'wss://nodejs-production-aa37f.up.railway.app';
    } else {
      this.baseUrl = 'ws://localhost:3001';
    }
    
    console.log('StreamingService: Using base URL:', this.baseUrl);
  }

  async generateStreamKey(): Promise<StreamConfig> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to generate a stream key');
    }

    // Generate secure stream key with user identifier
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const userPrefix = user.id.slice(0, 8);
    const streamKey = `nf_${userPrefix}_${timestamp}_${randomString}`;
    
    const isProduction = window.location.hostname !== 'localhost';
    
    const rtmpUrl = isProduction 
      ? 'rtmp://nodejs-production-aa37f.up.railway.app/live'
      : 'rtmp://localhost:1935/live';
        
    const hlsUrl = isProduction
      ? `https://nodejs-production-aa37f.up.railway.app/live/${streamKey}/index.m3u8`
      : `http://localhost:8080/live/${streamKey}/index.m3u8`;

    // Save stream to database with enhanced metadata
    const { data: stream, error } = await supabase
      .from('streams')
      .insert({
        user_id: user.id,
        stream_key: streamKey,
        rtmp_url: rtmpUrl,
        hls_url: hlsUrl,
        status: 'offline',
        is_active: true,
        viewer_count: 0,
        duration: 0,
        bitrate: 0,
        resolution: '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save stream to database:', error);
      throw new Error('Failed to generate stream key. Please try again.');
    }

    const config: StreamConfig = {
      rtmpUrl,
      streamKey,
      hlsUrl,
      isLive: false,
      viewerCount: 0
    };

    // Store in localStorage as backup
    localStorage.setItem('nightflow_stream_config', JSON.stringify(config));
    
    return config;
  }

  async getCurrentStream(): Promise<StreamConfig | null> {
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
      return null;
    }

    return {
      rtmpUrl: stream.rtmp_url,
      streamKey: stream.stream_key,
      hlsUrl: stream.hls_url,
      isLive: stream.status === 'live',
      viewerCount: stream.viewer_count || 0
    };
  }

  async revokeStreamKey(): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to revoke stream key');
    }

    // Deactivate current stream in database
    const { error } = await supabase
      .from('streams')
      .update({ 
        is_active: false,
        status: 'offline',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to revoke stream in database:', error);
    }

    localStorage.removeItem('nightflow_stream_config');
    this.disconnect();
  }

  async getStreamStatus(streamKey: string): Promise<StreamStatus> {
    try {
      const httpUrl = this.baseUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      const response = await fetch(`${httpUrl}/api/stream/${streamKey}/status`);
      
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
      console.warn('Streaming server not available:', error);
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
        viewerCount: stream.viewer_count || 0,
        duration: stream.duration || 0,
        bitrate: stream.bitrate || 0,
        resolution: stream.resolution || ''
      };
    }

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
        console.log('Connected to Nightflow streaming WebSocket');
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
                console.warn('Failed to update stream status:', error);
              }
            });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.warn('WebSocket connection failed, using database polling:', error);
        this.startPolling(streamKey);
      };

      this.websocket.onclose = () => {
        console.log('Streaming WebSocket connection closed');
      };
    } catch (error) {
      console.warn('WebSocket not available, using database polling:', error);
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

      return !error && !!stream;
    } catch (error) {
      console.warn('Stream validation failed:', error);
      return false;
    }
  }

  // New method to get streaming server status
  async getServerStatus(): Promise<{ available: boolean; url: string }> {
    try {
      const httpUrl = this.baseUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      console.log('StreamingService: Checking server status at:', httpUrl);
      
      const response = await fetch(`${httpUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000) // Increased to 10 second timeout
      });
      
      console.log('StreamingService: Server response:', response.status, response.ok);
      
      return {
        available: response.ok,
        url: httpUrl
      };
    } catch (error) {
      console.error('StreamingService: Server check failed:', error);
      return {
        available: false,
        url: this.baseUrl.replace('ws://', 'http://').replace('wss://', 'https://')
      };
    }
  }
}

export const streamingService = new StreamingService();
export type { StreamConfig, StreamStatus };
