
import { StreamingConfig } from './config';

export class StreamKeyGenerator {
  static generate(userId: string): string {
    return StreamingConfig.generateStreamKey(userId);
  }

  static generateUrls(streamKey: string) {
    const rtmpUrl = StreamingConfig.getRtmpUrl();
    const hlsUrl = StreamingConfig.getHlsUrl(streamKey);
    
    return {
      rtmpUrl,
      hlsUrl
    };
  }
}
