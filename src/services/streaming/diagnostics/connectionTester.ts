
import { URLGenerator } from '../core/urlGenerator';
import { EnvironmentConfig } from '../core/environment';

export class ConnectionTester {
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const serverUrl = URLGenerator.getOBSServerUrl();
    
    const testServer = async () => {
      try {
        console.log('🔍 Testing DigitalOcean Droplet RTMP server...');
        
        // Test the correct HTTP endpoint based on your server logs
        const healthUrl = `http://${EnvironmentConfig.getDropletDomain()}:3001/health`;
        
        console.log('📡 Testing Droplet health endpoint:', healthUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏰ Request timed out after 15 seconds');
          controller.abort();
        }, 15000);
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 Droplet health response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ DigitalOcean Droplet responded successfully:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ Droplet returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `Server returned ${response.status}: ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ Droplet connectivity test failed:', error);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'Connection timeout - server may be slow to respond'
            };
          } else if (error.message.includes('fetch')) {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'Network error - check internet connection'
            };
          }
        }
        
        return { 
          success: false, 
          url: serverUrl, 
          error: error instanceof Error ? error.message : 'Unknown connection error'
        };
      }
    };

    const result = await testServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ DigitalOcean Droplet is online and responding!');
      recommendations.push('✅ RTMP server should be accessible on port 1935');
      recommendations.push(`✅ Try OBS connection: ${serverUrl}`);
      recommendations.push('✅ Your stream key should work now');
    } else {
      recommendations.push('❌ DigitalOcean Droplet health check failed');
      recommendations.push('⚠️ Check if your Droplet is running');
      recommendations.push('💡 Verify firewall allows port 1935');
      recommendations.push('🔧 Ensure RTMP server is started on the Droplet');
      recommendations.push('📞 Check Droplet status in DigitalOcean dashboard');
    }

    return {
      primary: result,
      backup: result,
      recommendations
    };
  }
}
