
import { useState, useEffect } from 'react';

export const useServerTest = () => {
  const [serverTest, setServerTest] = useState<{ available: boolean; details: string[] } | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const testNetworkConnectivity = async () => {
    console.group('🔍 DigitalOcean Droplet Connectivity Test');
    
    const results = [];
    
    // Test DigitalOcean droplet endpoints
    const testUrls = [
      { url: 'http://67.205.179.77:3001/health', name: 'Droplet Health Check' },
      { url: 'http://67.205.179.77:3001/api/server/stats', name: 'Droplet Server Stats API' },
      { url: 'https://httpbin.org/get', name: 'Internet Connectivity Test' }
    ];

    let dropletOnline = false;

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
        
        if (test.name.includes('Droplet')) {
          dropletOnline = true;
        }
        
        results.push(`✅ ${test.name}: Connected (${response.status})`);
        console.log(`✅ ${test.name}: OK`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Connection failed';
        results.push(`❌ ${test.name}: ${errorMsg}`);
        console.error(`❌ ${test.name}:`, error);
      }
    }

    // Droplet specific diagnostics
    results.push('');
    results.push('🎯 DigitalOcean Droplet Configuration:');
    results.push(`• Droplet IP: 67.205.179.77`);
    results.push(`• RTMP Server: rtmp://67.205.179.77:1935/live`);
    results.push(`• HLS Streaming: http://67.205.179.77:3001/live/[streamKey]/index.m3u8`);
    results.push(`• API Endpoint: http://67.205.179.77:3001/api`);
    
    if (!dropletOnline) {
      results.push('');
      results.push('⚠️ DROPLET APPEARS OFFLINE:');
      results.push('• SSH to droplet: ssh root@67.205.179.77');
      results.push('• Check if streaming service is running');
      results.push('• Verify ports 1935, 3001, 8888 are open');
      results.push('• Restart streaming server if needed');
    } else {
      results.push('');
      results.push('✅ DROPLET ONLINE - READY FOR OBS:');
      results.push('• Configure OBS with: rtmp://67.205.179.77:1935/live');
      results.push('• Use your generated stream key');
      results.push('• Click "Start Streaming" in OBS');
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
    return { results, dropletOnline };
  };

  const handleTestServer = async () => {
    setTestingServer(true);
    console.log('🔍 Starting comprehensive droplet connectivity test...');
    
    try {
      const { results, dropletOnline } = await testNetworkConnectivity();
      
      setServerTest({ 
        available: dropletOnline, 
        details: results
      });
      
      console.log('Droplet test completed:', { dropletOnline });
    } catch (error) {
      console.error('Droplet test failed:', error);
      setServerTest({ 
        available: false, 
        details: [
          '❌ DigitalOcean droplet connectivity test failed',
          'Cannot reach your streaming server',
          '',
          '🔧 Next Steps:',
          '• Check if your droplet is running',
          '• SSH to droplet: ssh root@67.205.179.77',
          '• Restart streaming services if needed',
          '• Verify firewall allows ports 1935, 3001, 8888'
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
