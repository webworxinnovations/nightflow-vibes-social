
import { useState, useEffect } from 'react';

export const useServerTest = () => {
  const [serverTest, setServerTest] = useState<{ available: boolean; details: string[] } | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const testNetworkConnectivity = async () => {
    console.group('🔍 Network Connectivity Analysis - DigitalOcean Droplet');
    
    const results = [];
    
    // Test DigitalOcean droplet endpoints
    const testUrls = [
      { url: 'http://67.205.179.77:3001/health', name: 'Droplet Health Check' },
      { url: 'http://67.205.179.77:3001/api/server/stats', name: 'Droplet Server Stats API' },
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
    console.log('🔍 Starting comprehensive droplet connectivity test...');
    
    try {
      const networkResults = await testNetworkConnectivity();
      
      // Check if droplet servers are available
      const dropletAvailable = networkResults.some(r => r.includes('Droplet Health Check: Connected'));
      const apiAvailable = networkResults.some(r => r.includes('Droplet Server Stats API: Connected'));
      
      const combinedDetails = [
        '🏥 DigitalOcean Droplet Health Check Results:',
        dropletAvailable ? '✅ DigitalOcean Droplet: Online' : '❌ DigitalOcean Droplet: Offline',
        apiAvailable ? '✅ Streaming API: Online' : '❌ Streaming API: Offline',
        '',
        '🌐 Network Connectivity Tests:',
        ...networkResults,
        '',
        '🎯 Droplet Configuration:',
        '• RTMP Server: rtmp://67.205.179.77:1935/live',
        '• HLS Streaming: http://67.205.179.77:3001/live/[streamKey]/index.m3u8',
        '• WebSocket: ws://67.205.179.77:3001/ws/stream/[streamKey]',
        '• All services using droplet IP directly'
      ];

      setServerTest({ 
        available: dropletAvailable, 
        details: combinedDetails
      });
      
      console.log('Droplet test completed:', { dropletAvailable, apiAvailable });
    } catch (error) {
      console.error('Droplet test failed:', error);
      setServerTest({ 
        available: false, 
        details: [
          '❌ DigitalOcean droplet connectivity test failed', 
          'Droplet is not responding',
          'Check droplet deployment status',
          '',
          '💡 Droplet Configuration Should Be:',
          '• RTMP Server: rtmp://67.205.179.77:1935/live',
          '• HLS Streaming: http://67.205.179.77:3001/live/[streamKey]/index.m3u8'
        ] 
      });
    } finally {
      setTestingServer(false);
    }
  };

  // Auto-test droplet on mount
  useEffect(() => {
    handleTestServer();
  }, []);

  return {
    serverTest,
    testingServer,
    handleTestServer
  };
};
