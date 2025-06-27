
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
        console.log('🔍 Testing DigitalOcean App Platform deployment status...');
        
        // Test the DigitalOcean App Platform deployment
        const appUrl = `https://${EnvironmentConfig.getDropletDomain()}`;
        
        console.log('📡 Testing DigitalOcean App Platform at:', appUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏰ DigitalOcean App Platform request timed out after 15 seconds');
          controller.abort();
        }, 15000);
        
        const response = await fetch(`${appUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 DigitalOcean App Platform response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ DigitalOcean App Platform is running:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ DigitalOcean App Platform returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `DigitalOcean App Platform error: ${response.status} ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ DigitalOcean App Platform connectivity failed:', error);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'DigitalOcean App Platform timeout - deployment may be slow or failed'
            };
          } else if (error.message.includes('fetch') || error.message.includes('network')) {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'DigitalOcean App Platform not accessible - deployment may have failed'
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

    const result = await testServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ DigitalOcean App Platform is running successfully!');
      recommendations.push('✅ RTMP server should be accessible for OBS');
      recommendations.push(`✅ OBS Server URL: ${serverUrl}`);
      recommendations.push('✅ Generate a stream key and try OBS connection');
      recommendations.push('🎯 Your streaming infrastructure is ready!');
    } else {
      recommendations.push('❌ DigitalOcean App Platform is not accessible');
      recommendations.push('🔧 Your deployment may have failed or crashed');
      recommendations.push('📋 Action needed: Check DigitalOcean App Platform dashboard');
      recommendations.push('🔍 Look for build failures or runtime errors in logs');
      recommendations.push('🔄 Try redeploying your application');
      recommendations.push('💡 Alternative: Use Browser Streaming method instead');
      recommendations.push('📞 Contact support if deployment keeps failing');
    }

    return {
      primary: result,
      backup: result,
      recommendations
    };
  }
}
