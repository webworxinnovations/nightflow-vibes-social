
import { URLGenerator } from './core/urlGenerator';
import { EnvironmentConfig } from './core/environment';
import { OBSSetup } from './obs/obsSetup';
import { ConnectionTester } from './diagnostics/connectionTester';

export class StreamingConfig {
  private static readonly STREAM_KEY_PREFIX = 'nf_';
  
  static generateStreamKey(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${this.STREAM_KEY_PREFIX}${userId.replace(/-/g, '')}_${timestamp}_${random}`;
  }

  static getRtmpUrl(): string {
    return URLGenerator.getRtmpUrl();
  }

  static getHlsUrl(streamKey: string): string {
    return URLGenerator.getHlsUrl(streamKey);
  }

  static getApiBaseUrl(): string {
    return URLGenerator.getApiBaseUrl();
  }

  static getWebSocketUrl(streamKey: string): string {
    return URLGenerator.getWebSocketUrl(streamKey);
  }

  static validateStreamKey(streamKey: string): boolean {
    return streamKey.startsWith(this.STREAM_KEY_PREFIX) && streamKey.length > 20;
  }

  // Add missing methods that components are trying to use
  static getPortInfo() {
    return OBSSetup.getPortInfo();
  }

  static getProtocolInfo() {
    return OBSSetup.getProtocolInfo();
  }

  static isProduction(): boolean {
    return EnvironmentConfig.isProduction();
  }

  static getOBSSetupInstructions() {
    return OBSSetup.getOBSSetupInstructions();
  }

  static getOBSServerUrl(): string {
    return URLGenerator.getOBSServerUrl();
  }

  static getTroubleshootingSteps(): string[] {
    return OBSSetup.getTroubleshootingSteps();
  }

  static async testRTMPConnection() {
    return ConnectionTester.testRTMPConnection();
  }
}
