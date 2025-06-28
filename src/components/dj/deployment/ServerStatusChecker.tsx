
import { useState, useEffect } from "react";
import { streamingService } from "@/services/streamingService";

interface ServerStatus {
  available: boolean;
  url: string;
}

interface DebugInfo {
  [endpoint: string]: {
    status: number | string;
    ok?: boolean;
    text?: string;
    error?: string;
  };
}

export const useServerStatusChecker = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const checkServerStatus = async () => {
    setChecking(true);
    try {
      console.log('🔍 Checking DigitalOcean app deployment status...');
      const status = await streamingService.getServerStatus();
      setServerStatus(status);
      console.log('📊 Server status result:', status);
      
      // Try multiple endpoints for debugging
      const testEndpoints = ['/', '/health', '/api/server/stats'];
      const results: DebugInfo = {};
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`https://nightflow-app-wijb2.ondigitalocean.app${endpoint}`);
          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            text: await response.text().catch(() => 'Could not read response')
          };
        } catch (error) {
          results[endpoint] = {
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
      
      setDebugInfo(results);
      console.log('🔬 Debug test results:', results);
      
    } catch (error) {
      console.error('❌ Failed to check server status:', error);
      setServerStatus({ available: false, url: 'https://nightflow-app-wijb2.ondigitalocean.app' });
    } finally {
      setChecking(false);
    }
  };

  const testSpecificEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(`https://nightflow-app-wijb2.ondigitalocean.app${endpoint}`);
      const text = await response.text();
      console.log(`🧪 Test ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: text
      });
      return { status: response.status, ok: response.ok, text };
    } catch (error) {
      console.error(`💥 Test ${endpoint} failed:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  return {
    serverStatus,
    checking,
    debugInfo,
    checkServerStatus,
    testSpecificEndpoint
  };
};
