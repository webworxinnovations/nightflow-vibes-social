
import { useState, useEffect } from 'react';
import { EnvironmentConfig } from '@/services/streaming/core/environment';

export const useServerTest = () => {
  const [serverTest, setServerTest] = useState<{ available: boolean; details: string[] } | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const testNetworkConnectivity = async () => {
    console.group('🔍 Network Connectivity Analysis');
    
    const results = [];
    const testUrls = [
      { url: 'http://67.205.179.77:8888/health', name: 'HLS Server Health' },
      { url: 'http://67.205.179.77:3001/health', name: 'API Server Health' },
      { url: 'http://67.205.179.77:1935', name: 'RTMP Server Check' },
      { url: 'https://httpbin.org/get', name: 'Internet Connectivity' }
    ];

    for (const test of testUrls) {
      try {
        console.log(`Testing: ${test.name} - ${test.url}`);
        const response = await fetch(test.url, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        results.push(`✅ ${test.name}: Connected`);
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
      const envResult = await EnvironmentConfig.checkServerStatus();
      
      const combinedDetails = [
        ...envResult.details,
        '',
        '🌐 Network Connectivity Tests:',
        ...networkResults
      ];

      setServerTest({ 
        available: envResult.available, 
        details: combinedDetails
      });
      
      console.log('Server test completed:', envResult);
    } catch (error) {
      console.error('Server test failed:', error);
      setServerTest({ 
        available: false, 
        details: [
          '❌ Comprehensive server test failed', 
          'Network connectivity issues detected',
          'Check your internet connection and firewall settings'
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
