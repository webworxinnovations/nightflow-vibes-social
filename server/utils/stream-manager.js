
class StreamManager {
  constructor() {
    this.activeStreams = new Map();
  }
  
  addStream(streamKey) {
    if (streamKey && streamKey.startsWith('nf_')) {
      console.log(`Stream started: ${streamKey}`);
      this.activeStreams.set(streamKey, {
        streamKey,
        startTime: Date.now(),
        viewerCount: 0
      });
    }
  }
  
  removeStream(streamKey) {
    if (streamKey && this.activeStreams.has(streamKey)) {
      console.log(`Stream ended: ${streamKey}`);
      this.activeStreams.delete(streamKey);
    }
  }
  
  getStream(streamKey) {
    return this.activeStreams.get(streamKey);
  }
  
  getAllStreams() {
    return Array.from(this.activeStreams.values());
  }
  
  getStreamCount() {
    return this.activeStreams.size;
  }
}

module.exports = StreamManager;
