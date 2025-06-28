
import { ServerStatusResponse } from './types';
import { EnvironmentConfig } from './core/environment';

export class ServerStatusChecker {
  static async checkStatus(): Promise<ServerStatusResponse> {
    try {
      console.log('🔍 Testing DigitalOcean deployment server connectivity...');
      const deploymentUrl = EnvironmentConfig.getActualDeploymentUrl();
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
        console.log('✅ DigitalOcean deployment is operational:', data);
        
        return {
          available: true,
          url: deploymentUrl,
          version: data.version || '2.0.4',
          uptime: data.uptime || 0
        };
      } else {
        console.log('⚠️ Deployment responded with error:', response.status);
        return {
          available: false,
          url: deploymentUrl
        };
      }
    } catch (error) {
      console.error('❌ DigitalOcean deployment connectivity test failed:', error);
      
      // Return false since we can't reach the actual deployment
      return {
        available: false,
        url: EnvironmentConfig.getActualDeploymentUrl()
      };
    }
  }
}
