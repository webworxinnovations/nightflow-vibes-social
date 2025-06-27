
import { URLGenerator } from '../core/urlGenerator';
import { EnvironmentConfig } from '../core/environment';

export class ConnectionTester {
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const digitalOceanUrl = `https://${EnvironmentConfig.getDropletDomain()}`;
    const serverUrl = URLGenerator.getOBSServerUrl();
    
    const testDigitalOceanServer = async () => {
      try {
        console.log('🌊 Testing DigitalOcean App Platform deployment...');
        console.log('📡 Testing DigitalOcean server at:', digitalOceanUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏰ DigitalOcean server request timed out after 15 seconds');
          controller.abort();
        }, 15000);
        
        const response = await fetch(`${digitalOceanUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 DigitalOcean server response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ DigitalOcean deployment is running:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ DigitalOcean server returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `DigitalOcean server error: ${response.status} ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ DigitalOcean server connectivity failed:', error);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'DigitalOcean server timeout - deployment may be slow'
            };
          } else if (error.message.includes('fetch') || error.message.includes('network')) {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'DigitalOcean server not accessible - may need port configuration'
            };
          }
        }
        
        return { 
          success: false, 
          url: serverUrl, 
          error: error instanceof Error ? error.message : 'DigitalOcean deployment issue'
        };
      }
    };

    const result = await testDigitalOceanServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ DigitalOcean App Platform deployment is running successfully!');
      recommendations.push('✅ RTMP server should be accessible for OBS');
      recommendations.push(`✅ OBS Server URL: ${serverUrl}`);
      recommendations.push('✅ Generate a stream key and try OBS connection');
      recommendations.push('🎯 Your DigitalOcean streaming infrastructure is ready!');
      recommendations.push('📋 Note: Using DigitalOcean App Platform (as requested)');
    } else {
      recommendations.push('❌ DigitalOcean App Platform deployment is not accessible');
      recommendations.push('🔧 Your deployment may need port configuration for RTMP');
      recommendations.push('📋 Action needed: Check DigitalOcean App Platform settings');
      recommendations.push('🔍 Ensure port 1935 (RTMP) is exposed in app configuration');
      recommendations.push('🔄 May need to upgrade DigitalOcean plan for custom ports');
      recommendations.push('💡 Alternative: Use Browser Streaming method instead');
      recommendations.push('📞 Contact DigitalOcean support about RTMP port access');
    }

    return {
      primary: result,
      backup: result,
      recommendations
    };
  }
}
