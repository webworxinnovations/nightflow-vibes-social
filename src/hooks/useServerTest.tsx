
import { useState, useEffect } from 'react';
import { EnvironmentConfig } from '@/services/streaming/core/environment';

export const useServerTest = () => {
  const [serverTest, setServerTest] = useState<{ available: boolean; details: string[] } | null>(null);
  const [testingServer, setTestingServer] = useState(false);

  const handleTestServer = async () => {
    setTestingServer(true);
    console.log('🔍 Testing DigitalOcean server connectivity...');
    
    try {
      const result = await EnvironmentConfig.checkServerStatus();
      setServerTest(result);
      console.log('Server test results:', result);
    } catch (error) {
      console.error('Server test failed:', error);
      setServerTest({ 
        available: false, 
        details: ['❌ Server connectivity test failed', 'Check your internet connection and try again'] 
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
