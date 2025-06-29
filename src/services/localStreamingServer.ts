
export class LocalStreamingServer {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private streamKey: string = '';
  private isRecording = false;

  async startServer(streamKey: string): Promise<{ rtmpUrl: string; hlsUrl: string }> {
    this.streamKey = streamKey;
    
    // For local development, we'll use a mock RTMP server approach
    const rtmpUrl = `rtmp://localhost:1935/live/${streamKey}`;
    const hlsUrl = `http://localhost:3001/live/${streamKey}/index.m3u8`;
    
    console.log('🚀 Local streaming server ready');
    console.log('📡 RTMP URL for OBS:', rtmpUrl);
    console.log('🎥 HLS URL for playback:', hlsUrl);
    
    return { rtmpUrl, hlsUrl };
  }

  async startWebcamStream(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      console.log('📹 Webcam stream started');
      return this.stream;
    } catch (error) {
      console.error('Failed to start webcam:', error);
      throw error;
    }
  }

  startRecording(stream: MediaStream) {
    this.recordedChunks = [];
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start(100); // Record in 100ms chunks
    this.isRecording = true;
    
    console.log('🔴 Recording started');
  }

  stopRecording(): Blob | null {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      console.log('⏹️ Recording stopped');
      return blob;
    }
    return null;
  }

  getStreamStatus() {
    return {
      isLive: this.isRecording,
      streamKey: this.streamKey,
      hasWebcam: !!this.stream,
      isRecording: this.isRecording
    };
  }

  cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.recordedChunks = [];
    this.isRecording = false;
  }
}

export const localStreamingServer = new LocalStreamingServer();
