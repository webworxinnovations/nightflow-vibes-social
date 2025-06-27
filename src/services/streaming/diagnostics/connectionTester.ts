
import { URLGenerator } from '../core/urlGenerator';
import { EnvironmentConfig } from '../core/environment';

export class ConnectionTester {
  static async testRTMPConnection(): Promise<{
    primary: { success: boolean; url: string; error?: string };
    backup: { success: boolean; url: string; error?: string };
    recommendations: string[];
  }> {
    const dropletApiUrl = `http://${EnvironmentConfig.getDropletIP()}:3001`;
    const rtmpUrl = URLGenerator.getOBSServerUrl();
    
    const testDropletServer = async () => {
      try {
        console.log('🌊 Testing DigitalOcean Droplet RTMP server...');
        console.log('📡 Testing droplet server at:', dropletApiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏰ Droplet server request timed out after 10 seconds');
          controller.abort();
        }, 10000);
        
        const response = await fetch(`${dropletApiUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 Droplet server response:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.text();
          console.log('✅ Droplet RTMP server is running:', data);
          return { success: true, url: rtmpUrl, error: undefined };
        } else {
          console.log('⚠️ Droplet server returned error:', response.status);
          return { 
            success: false, 
            url: rtmpUrl, 
            error: `Droplet server error: ${response.status} ${response.statusText}`
          };
        }
      } catch (error) {
        console.error('❌ Droplet server connectivity failed:', error);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { 
              success: false, 
              url: rtmpUrl, 
              error: 'Droplet server timeout - server may not be started yet'
            };
          } else if (error.message.includes('fetch') || error.message.includes('network')) {
            return { 
              success: false, 
              url: rtmpUrl, 
              error: 'Droplet server not accessible - check if RTMP server is running'
            };
          }
        }
        
        return { 
          success: false, 
          url: rtmpUrl, 
          error: error instanceof Error ? error.message : 'Droplet server connection issue'
        };
      }
    };

    const result = await testDropletServer();
    const recommendations = [];
    
    if (result.success) {
      recommendations.push('✅ DigitalOcean Droplet RTMP server is running!');
      recommendations.push('✅ RTMP server is accessible for OBS streaming');
      recommendations.push(`✅ OBS Server URL: ${rtmpUrl}`);
      recommendations.push('✅ Generate a stream key and connect OBS now');
      recommendations.push('🎯 Your droplet RTMP infrastructure is ready!');
      recommendations.push(`📋 Droplet IP: ${EnvironmentConfig.getDropletIP()}`);
    } else {
      recommendations.push('❌ DigitalOcean Droplet RTMP server is not running');
      recommendations.push('🔧 You need to deploy and start the RTMP server on your droplet');
      recommendations.push(`📋 SSH to your droplet: ssh root@${EnvironmentConfig.getDropletIP()}`);
      recommendations.push('🔍 Run the deployment commands to install Node.js and RTMP server');
      recommendations.push('🔄 Start the server with: pm2 start streaming-server.js');
      recommendations.push('🛠️ Make sure ports 1935 (RTMP) and 3001 (API) are open in firewall');
      recommendations.push('💡 Follow the droplet setup guide step by step');
    }

    return {
      primary: result,
      backup: result,
      recommendations
    };
  }
}
