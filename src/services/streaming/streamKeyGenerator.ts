
import { v4 as uuidv4 } from 'uuid';
import { URLGenerator } from './core/urlGenerator';

export class StreamKeyGenerator {
  static generate(userId: string): string {
    // Generate a unique stream key with the required "nf_" prefix
    const timestamp = Date.now();
    const randomId = uuidv4().split('-')[0];
    const userPrefix = userId.split('-')[0];
    return `nf_${userPrefix}_${timestamp}_${randomId}`;
  }

  static generateUrls(streamKey: string) {
    const rtmpUrl = URLGenerator.getRtmpUrl();
    const hlsUrl = URLGenerator.getHlsUrl(streamKey);
    
    console.log('🔑 StreamKeyGenerator - URLs generated:');
    console.log('- Stream Key:', streamKey);
    console.log('- RTMP URL:', rtmpUrl);
    console.log('- HLS URL:', hlsUrl);
    
    return {
      rtmpUrl,
      hlsUrl,
      streamKey
    };
  }
}
