
import { ServerStatusResponse } from './types';
import { EnvironmentConfig } from './core/environment';

export class ServerStatusChecker {
  static async checkStatus(): Promise<ServerStatusResponse> {
    try {
      console.log('🔍 Testing DigitalOcean droplet server connectivity...');
      const deploymentUrl = 'http://67.205.179.77:3001';
      const healthUrl = `${deploymentUrl}/health`;
      
      console.log('📡 Testing server at:', healthUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 10 seconds');
        controller.abort();
      }, 10000);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json().catch(() => ({ status: 'ok' }));
        console.log('✅ DigitalOcean droplet is operational:', data);
        
        return {
          available: true,
          url: deploymentUrl,
          version: data.version || '2.0.4',
          uptime: data.uptime || 0
        };
      } else {
        console.log('⚠️ Droplet responded with error:', response.status);
        return {
          available: false,
          url: deploymentUrl,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity test failed:', error);
      
      return {
        available: false,
        url: 'http://67.205.179.77:3001',
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}
