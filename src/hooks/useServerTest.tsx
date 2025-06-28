
import { useState, useEffect } from 'react';

export const useServerTest = () => {
  const [serverTest, setServerTest] = useState<{ available: boolean; details: string[] } | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const testNetworkConnectivity = async () => {
    console.group('🔍 Network Connectivity Analysis');
    
    const results = [];
    
    // Test streaming server endpoints
    const testUrls = [
      { url: 'http://67.205.179.77:8888/health', name: 'HLS Server Health' },
      { url: 'http://67.205.179.77:1935/health', name: 'RTMP Server Health' },
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
      const hlsAvailable = networkResults.some(r => r.includes('HLS Server Health: Connected'));
      const rtmpAvailable = networkResults.some(r => r.includes('RTMP Server Health: Connected'));
      
      const combinedDetails = [
        '🏥 Server Health Check Results:',
        hlsAvailable ? '✅ HLS Streaming Server: Online' : '❌ HLS Streaming Server: Offline',
        rtmpAvailable ? '✅ RTMP Streaming Server: Online' : '❌ RTMP Streaming Server: Offline',
        '',
        '🌐 Network Connectivity Tests:',
        ...networkResults
      ];

      setServerTest({ 
        available: hlsAvailable && rtmpAvailable, 
        details: combinedDetails
      });
      
      console.log('Server test completed:', { hlsAvailable, rtmpAvailable });
    } catch (error) {
      console.error('Server test failed:', error);
      setServerTest({ 
        available: false, 
        details: [
          '❌ Server connectivity test failed', 
          'Streaming servers are not responding',
          'Check server deployment and firewall settings'
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
