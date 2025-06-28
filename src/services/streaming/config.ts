
import { URLGenerator } from './core/urlGenerator';

export class StreamingConfig {
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `nf_${userId.split('-')[0]}_${timestamp}_${random}`;
  }

  static getRtmpUrl(): string {
    return URLGenerator.getRtmpUrl();
  }

  static getHlsUrl(streamKey: string): string {
    return URLGenerator.getHlsUrl(streamKey);
  }

  static getWebSocketUrl(streamKey: string): string {
    return URLGenerator.getWebSocketUrl(streamKey);
  }

  static getApiBaseUrl(): string {
    return URLGenerator.getApiBaseUrl();
  }
}
