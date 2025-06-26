
import { EnvironmentConfig } from './core/environment';
import { URLGenerator } from './core/urlGenerator';
import { StreamKeyGenerator } from './utils/streamKeyGenerator';
import { OBSSetup } from './obs/obsSetup';
import { ConnectionTester } from './diagnostics/connectionTester';

export class StreamingConfig {
  // Environment detection
  static isProduction(): boolean {
    return EnvironmentConfig.isProduction();
  }

  // URL generation
  static getApiBaseUrl(): string {
    return URLGenerator.getApiBaseUrl();
  }

  static getOBSServerUrl(): string {
    return URLGenerator.getOBSServerUrl();
  }

  static getOBSServerUrlBackup(): string {
    return URLGenerator.getOBSServerUrl();
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

  // Stream key generation
  static generateStreamKey(userId: string): string {
    return StreamKeyGenerator.generateStreamKey(userId);
  }

  // OBS setup information
  static getPortInfo(): {
    rtmpPort: number;
    description: string;
    compatibility: string;
  } {
    return OBSSetup.getPortInfo();
  }

  static getProtocolInfo(): {
    protocol: string;
    description: string;
  } {
    return OBSSetup.getProtocolInfo();
  }

  static getOBSSetupInstructions(): {
    service: string;
    server: string;
    backup_server: string;
    steps: string[];
  } {
    return OBSSetup.getOBSSetupInstructions();
  }

  static getTroubleshootingSteps(): string[] {
    return OBSSetup.getTroubleshootingSteps();
  }

  // Connection testing
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    return ConnectionTester.testRTMPConnection();
  }
}
