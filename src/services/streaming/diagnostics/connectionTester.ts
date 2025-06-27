
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
        console.log('🔍 Testing DigitalOcean App Platform server...');
        
        // DigitalOcean App Platform uses HTTPS by default
        const healthUrl = `https://${EnvironmentConfig.getDropletDomain()}/health`;
        
        console.log('📡 Testing DigitalOcean App Platform health endpoint:', healthUrl);
        
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
        
        console.log('📊 DigitalOcean App Platform health response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ DigitalOcean App Platform responded successfully:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ App Platform returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `Server returned ${response.status}: ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ App Platform connectivity test failed:', error);
        
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
              error: 'Network error - check if server is deployed and running'
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
      recommendations.push('✅ DigitalOcean App Platform is online and responding!');
      recommendations.push('✅ RTMP server should be accessible on port 1935');
      recommendations.push(`✅ Try OBS connection: ${serverUrl}`);
      recommendations.push('✅ Your stream key should work now');
    } else {
      recommendations.push('❌ DigitalOcean App Platform health check failed');
      recommendations.push('⚠️ Check if your app is deployed and running');
      recommendations.push('💡 Verify your app build completed successfully');
      recommendations.push('🔧 Check DigitalOcean App Platform logs for errors');
      recommendations.push('📞 Check app status in DigitalOcean dashboard');
    }

    return {
      primary: result,
      backup: result,
      recommendations
    };
  }
}
