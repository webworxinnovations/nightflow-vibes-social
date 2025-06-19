
class StreamManager {
  constructor() {
    this.streams = new Map();
  }
  
  addStream(streamKey) {
    const stream = {
      streamKey,
      startTime: Date.now(),
      viewerCount: 0,
      isLive: true
    };
    
    this.streams.set(streamKey, stream);
    console.log(`📹 Stream added: ${streamKey} (Total: ${this.streams.size})`);
    return stream;
  }
  
  removeStream(streamKey) {
    if (this.streams.has(streamKey)) {
      this.streams.delete(streamKey);
      console.log(`📹 Stream removed: ${streamKey} (Total: ${this.streams.size})`);
      return true;
    }
    return false;
  }
  
  getStream(streamKey) {
    return this.streams.get(streamKey) || null;
  }
  
  getAllStreams() {
    return Array.from(this.streams.values());
  }
  
  getStreamCount() {
    return this.streams.size;
  }
  
  incrementViewerCount(streamKey) {
    const stream = this.streams.get(streamKey);
    if (stream) {
      stream.viewerCount++;
      console.log(`👥 Viewer count for ${streamKey}: ${stream.viewerCount}`);
    }
  }
  
  decrementViewerCount(streamKey) {
    const stream = this.streams.get(streamKey);
    if (stream && stream.viewerCount > 0) {
      stream.viewerCount--;
      console.log(`👥 Viewer count for ${streamKey}: ${stream.viewerCount}`);
    }
  }
  
  updateViewerCount(streamKey, count) {
    const stream = this.streams.get(streamKey);
    if (stream) {
      stream.viewerCount = count;
    }
  }
}

module.exports = StreamManager;
