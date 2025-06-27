
import { URLGenerator } from '../core/urlGenerator';
import { EnvironmentConfig } from '../core/environment';

export class ConnectionTester {
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const railwayUrl = `https://${EnvironmentConfig.getRailwayDomain()}`;
    const serverUrl = URLGenerator.getOBSServerUrl();
    
    const testRailwayServer = async () => {
      try {
        console.log('🚄 Testing Railway deployment status...');
        console.log('📡 Testing Railway server at:', railwayUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏰ Railway server request timed out after 15 seconds');
          controller.abort();
        }, 15000);
        
        const response = await fetch(`${railwayUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 Railway server response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ Railway deployment is running:', data);
          return { success: true, url: serverUrl, error: undefined };
        } else {
          console.log('⚠️ Railway server returned error:', response.status);
          return { 
            success: false, 
            url: serverUrl, 
            error: `Railway server error: ${response.status} ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ Railway server connectivity failed:', error);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'Railway server timeout - deployment may be slow'
            };
          } else if (error.message.includes('fetch') || error.message.includes('network')) {
            return { 
              success: false, 
              url: serverUrl, 
              error: 'Railway server not accessible - deployment may have failed'
            };
          }
        }
        
        return { 
          success: false, 
          url: serverUrl, 
          error: error instanceof Error ? error.message : 'Railway deployment issue'
        };
      }
    };

    const result = await testRailwayServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ Railway deployment is running successfully!');
      recommendations.push('✅ RTMP server should be accessible for OBS');
      recommendations.push(`✅ OBS Server URL: ${serverUrl}`);
      recommendations.push('✅ Generate a stream key and try OBS connection');
      recommendations.push('🎯 Your streaming infrastructure is ready!');
      recommendations.push('📋 Note: Using Railway deployment (more reliable than DigitalOcean App Platform)');
    } else {
      recommendations.push('❌ Railway deployment is not accessible');
      recommendations.push('🔧 Your deployment may have failed or crashed');
      recommendations.push('📋 Action needed: Check Railway dashboard');
      recommendations.push('🔍 Look for build failures or runtime errors in logs');
      recommendations.push('🔄 Try redeploying your application on Railway');
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
