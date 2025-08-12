/**
 * Stream Security Utilities
 * Enhanced security measures for streaming credentials
 */

import { toast } from 'sonner';

export class StreamSecurity {
  /**
   * Validates stream key format for security
   */
  static validateStreamKeyFormat(streamKey: string): boolean {
    // Stream keys must follow the pattern: nf_[timestamp]_[random]
    const pattern = /^nf_\d+_[a-z0-9]{8,}$/;
    return pattern.test(streamKey);
  }

  /**
   * Checks if stream key is expired based on embedded timestamp
   */
  static isStreamKeyExpired(streamKey: string, maxAgeHours: number = 24): boolean {
    if (!this.validateStreamKeyFormat(streamKey)) {
      return true;
    }

    try {
      const parts = streamKey.split('_');
      const timestamp = parseInt(parts[1]);
      const createdAt = timestamp * 1000; // Convert to milliseconds
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
      
      return (now - createdAt) > maxAge;
    } catch (error) {
      console.error('Failed to parse stream key timestamp:', error);
      return true; // Assume expired if we can't parse
    }
  }

  /**
   * Sanitizes stream key for logging (hides sensitive parts)
   */
  static sanitizeStreamKey(streamKey: string): string {
    if (!streamKey || streamKey.length < 8) {
      return '[INVALID_KEY]';
    }
    
    return `${streamKey.substring(0, 8)}...${streamKey.slice(-4)}`;
  }

  /**
   * Rate limiting for stream key generation
   */
  private static lastGenerationTime = 0;
  private static readonly MIN_GENERATION_INTERVAL = 10000; // 10 seconds

  static canGenerateStreamKey(): boolean {
    const now = Date.now();
    const timeSinceLastGeneration = now - this.lastGenerationTime;
    
    if (timeSinceLastGeneration < this.MIN_GENERATION_INTERVAL) {
      const remainingTime = Math.ceil((this.MIN_GENERATION_INTERVAL - timeSinceLastGeneration) / 1000);
      toast.error(`Please wait ${remainingTime} seconds before generating a new stream key`);
      return false;
    }
    
    this.lastGenerationTime = now;
    return true;
  }

  /**
   * Logs security events for audit purposes
   */
  static logSecurityEvent(event: string, details?: any): void {
    console.group('🔒 Stream Security Event');
    console.log('Event:', event);
    console.log('Timestamp:', new Date().toISOString());
    if (details) {
      console.log('Details:', details);
    }
    console.groupEnd();
  }

  /**
   * Validates stream URLs for security
   */
  static validateStreamUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Only allow specific domains and protocols
      const allowedDomains = ['67.205.179.77', 'localhost'];
      const allowedProtocols = ['https:', 'rtmp:'];
      
      return allowedProtocols.includes(urlObj.protocol) && 
             allowedDomains.includes(urlObj.hostname);
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks for potential stream hijacking attempts
   */
  static detectHijackingAttempt(streamKey: string, userAgent?: string): boolean {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /bot/i,
      /script/i
    ];

    if (userAgent) {
      return suspiciousPatterns.some(pattern => pattern.test(userAgent));
    }

    // Check for malformed stream keys that might indicate tampering
    return !this.validateStreamKeyFormat(streamKey);
  }
}