
import { useState, useEffect } from 'react';

export const useServerTest = () => {
  const [serverTest, setServerTest] = useState<{ available: boolean; details: string[] } | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const testNetworkConnectivity = async () => {
    console.group('🔍 Network Connectivity Analysis');
    
    const results = [];
    
    // Test DigitalOcean app endpoints
    const testUrls = [
      { url: 'https://nightflow-app-wijb2.ondigitalocean.app/health', name: 'App Health Check' },
      { url: 'https://nightflow-app-wijb2.ondigitalocean.app/api/server/stats', name: 'Server Stats API' },
      { url: 'https://httpbin.org/get', name: 'Internet Connectivity' }
    ];

    for (const test of testUrls) {
      try {
        console.log(`Testing: ${test.name} - ${test.url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(test.url, { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        results.push(`✅ ${test.name}: Connected (${response.status})`);
        console.log(`✅ ${test.name}: OK`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Connection failed';
        results.push(`❌ ${test.name}: ${errorMsg}`);
        console.error(`❌ ${test.name}:`, error);
      }
    }

    // Browser info
    results.push('');
    results.push('🖥️ Browser Information:');
    results.push(`• Online: ${navigator.onLine ? 'Yes' : 'No'}`);
    results.push(`• User Agent: ${navigator.userAgent.substring(0, 50)}...`);
    
    if ((navigator as any).connection) {
      const conn = (navigator as any).connection;
      results.push(`• Connection Type: ${conn.effectiveType || 'Unknown'}`);
      results.push(`• Downlink: ${conn.downlink || 'Unknown'} Mbps`);
    }

    console.groupEnd();
    return results;
  };

  const handleTestServer = async () => {
    setTestingServer(true);
    console.log('🔍 Starting comprehensive server connectivity test...');
    
    try {
      const networkResults = await testNetworkConnectivity();
      
      // Check if streaming servers are available
      const appAvailable = networkResults.some(r => r.includes('App Health Check: Connected'));
      const apiAvailable = networkResults.some(r => r.includes('Server Stats API: Connected'));
      
      const combinedDetails = [
        '🏥 Server Health Check Results:',
        appAvailable ? '✅ DigitalOcean App: Online' : '❌ DigitalOcean App: Offline',
        apiAvailable ? '✅ Streaming API: Online' : '❌ Streaming API: Offline',
        '',
        '🌐 Network Connectivity Tests:',
        ...networkResults
      ];

      setServerTest({ 
        available: appAvailable, 
        details: combinedDetails
      });
      
      console.log('Server test completed:', { appAvailable, apiAvailable });
    } catch (error) {
      console.error('Server test failed:', error);
      setServerTest({ 
        available: false, 
        details: [
          '❌ Server connectivity test failed', 
          'DigitalOcean app is not responding',
          'Check app deployment status'
        ] 
      });
    } finally {
      setTestingServer(false);
    }
  };

  // Auto-test server on mount
  useEffect(() => {
    handleTestServer();
  }, []);

  return {
    serverTest,
    testingServer,
    handleTestServer
  };
};
