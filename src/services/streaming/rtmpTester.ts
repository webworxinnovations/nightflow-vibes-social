
export class RTMPTester {
  static async testRTMPConnectivity(rtmpUrl: string): Promise<{
    success: boolean;
    details: string;
    suggestions: string[];
  }> {
    console.log('🔍 Testing RTMP connectivity:', rtmpUrl);
    
    // Parse RTMP URL to test different components
    const urlParts = rtmpUrl.match(/rtmp:\/\/([^:]+):(\d+)\/(.+)/);
    if (!urlParts) {
      return {
        success: false,
        details: 'Invalid RTMP URL format',
        suggestions: ['Check RTMP URL format: rtmp://host:port/app']
      };
    }

    const [, host, port, app] = urlParts;
    const suggestions: string[] = [];
    
    try {
      // Test 1: Check if host resolves
      console.log(`🌐 Testing host resolution: ${host}`);
      
      // Test 2: Check basic HTTP connectivity to the server
      const httpUrl = `https://${host}`;
      const httpResponse = await fetch(`${httpUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (!httpResponse.ok) {
        suggestions.push('HTTP server not responding - check server deployment');
        return {
          success: false,
          details: `HTTP server check failed: ${httpResponse.status}`,
          suggestions
        };
      }

      const healthData = await httpResponse.json();
      console.log('🏥 Server health check:', healthData);

      // Test 3: Check if RTMP is specifically mentioned as ready
      if (!healthData.rtmp_ready) {
        suggestions.push('RTMP server reports not ready - check server logs');
        suggestions.push('Verify RTMP service is running on the server');
        return {
          success: false,
          details: 'RTMP server not ready according to health check',
          suggestions
        };
      }

      // Test 4: Check port accessibility (limited from browser)
      console.log(`🔌 RTMP endpoint should be: ${host}:${port}/${app}`);
      
      // Test 5: Railway-specific checks
      if (host.includes('railway.app')) {
        console.log('🚄 Railway deployment detected');
        suggestions.push('Railway RTMP Configuration:');
        suggestions.push('• Ensure RTMP_PORT=1935 is set in Railway environment');
        suggestions.push('• Verify Railway TCP proxy is configured for port 1935');
        suggestions.push('• Check Railway service logs for RTMP server startup');
      }

      // Test 6: Network diagnostics
      suggestions.push('Network Troubleshooting:');
      suggestions.push('• Try connecting from a different network (mobile hotspot)');
      suggestions.push('• Check if port 1935 is blocked by firewall/router');
      suggestions.push('• Some corporate networks block RTMP traffic');

      return {
        success: true,
        details: `Server is online and reports RTMP ready. Endpoint: ${rtmpUrl}`,
        suggestions: [
          'OBS Connection Steps:',
          '1. In OBS: Settings → Stream',
          '2. Service: Custom...',
          `3. Server: ${rtmpUrl}`,
          '4. Use Stream Key from the app',
          '5. Click "Apply" then "Start Streaming"'
        ]
      };

    } catch (error) {
      console.error('❌ RTMP connectivity test failed:', error);
      
      suggestions.push('Connection Test Failed:');
      suggestions.push('• Check internet connection');
      suggestions.push('• Verify server is running and accessible');
      suggestions.push('• Try connecting from different network');
      
      if (error instanceof Error && error.name === 'AbortError') {
        suggestions.push('• Connection timeout - server may be overloaded');
      }

      return {
        success: false,
        details: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions
      };
    }
  }

  static async performAdvancedDiagnostics(serverUrl: string): Promise<{
    serverInfo: any;
    rtmpStatus: any;
    recommendations: string[];
  }> {
    console.log('🔬 Performing advanced RTMP diagnostics...');
    
    try {
      // Get detailed server information
      const [healthResponse, rootResponse] = await Promise.all([
        fetch(`${serverUrl}/api/health`).then(r => r.json()).catch(() => null),
        fetch(`${serverUrl}/health`).then(r => r.json()).catch(() => null)
      ]);

      const recommendations: string[] = [];

      // Analyze server configuration
      if (healthResponse?.rtmp_ready === false) {
        recommendations.push('❌ RTMP Server Issue: Not ready');
        recommendations.push('• Check server deployment logs');
        recommendations.push('• Verify RTMP service startup');
      }

      if (rootResponse?.ports?.rtmp !== 1935) {
        recommendations.push('⚠️ Port Configuration: RTMP not on standard port 1935');
        recommendations.push('• Verify RTMP_PORT environment variable');
      }

      // Railway-specific diagnostics
      if (serverUrl.includes('railway.app')) {
        recommendations.push('🚄 Railway Deployment Checks:');
        recommendations.push('• Ensure railway.toml has TCP port 1935 configured');
        recommendations.push('• Check Railway service variables for RTMP_PORT');
        recommendations.push('• Verify Railway TCP proxy is active');
      }

      return {
        serverInfo: { health: healthResponse, root: rootResponse },
        rtmpStatus: {
          ready: healthResponse?.rtmp_ready,
          port: healthResponse?.rtmp_port || rootResponse?.ports?.rtmp,
          url: healthResponse?.rtmp_url
        },
        recommendations
      };

    } catch (error) {
      return {
        serverInfo: { error: error instanceof Error ? error.message : 'Unknown error' },
        rtmpStatus: { ready: false },
        recommendations: [
          '❌ Advanced diagnostics failed',
          '• Server may be completely offline',
          '• Check server deployment status',
          '• Verify network connectivity'
        ]
      };
    }
  }
}
