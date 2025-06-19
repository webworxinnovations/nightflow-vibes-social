
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
    // Use Railway URL for production, localhost for development
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    console.log('StreamingService: Environment detection:', {
      hostname: window.location.hostname,
      isLocalhost,
      protocol: window.location.protocol
    });
    
    if (isLocalhost) {
      this.baseUrl = 'http://localhost:3001';
    } else {
      // Use the correct Railway URL
      this.baseUrl = 'https://nodejs-production-aa37f.up.railway.app';
    }
    
    console.log('StreamingService: Using base URL:', this.baseUrl);
  }

  async generateStreamKey(): Promise<StreamConfig> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to generate a stream key');
    }

    // Check server availability first
    const serverStatus = await this.getServerStatus();
    if (!serverStatus.available) {
      throw new Error('Streaming server is not available. Please check deployment.');
    }

    // Generate secure stream key with user identifier
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const userPrefix = user.id.slice(0, 8);
    const streamKey = `nf_${userPrefix}_${timestamp}_${randomString}`;
    
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const rtmpUrl = isLocalhost 
      ? 'rtmp://localhost:1935/live'
      : 'rtmp://nodejs-production-aa37f.up.railway.app/live';
        
    const hlsUrl = isLocalhost
      ? `http://localhost:8080/live/${streamKey}/index.m3u8`
      : `https://nodejs-production-aa37f.up.railway.app/live/${streamKey}/index.m3u8`;

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
      const response = await fetch(`${this.baseUrl}/api/stream/${streamKey}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
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
      } else {
        console.warn('Stream status request failed:', response.status, response.statusText);
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
    // Skip WebSocket for now since server doesn't support it
    console.log('WebSocket connection skipped, using polling instead');
    this.startPolling(streamKey);
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

  // Enhanced server status check
  async getServerStatus(): Promise<{ available: boolean; url: string }> {
    try {
      console.log('StreamingService: Checking server status at:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      console.log('StreamingService: Server response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('StreamingService: Server health data:', data);
        return {
          available: true,
          url: this.baseUrl
        };
      } else {
        console.error('StreamingService: Server returned error:', response.status, response.statusText);
        return {
          available: false,
          url: this.baseUrl
        };
      }
    } catch (error) {
      console.error('StreamingService: Server check failed:', error);
      return {
        available: false,
        url: this.baseUrl
      };
    }
  }
}

export const streamingService = new StreamingService();
export type { StreamConfig, StreamStatus };
