
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export const ServerDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Basic connectivity
    console.log('🔍 Running comprehensive server diagnostics...');
    
    try {
      const response = await fetch('http://67.205.179.77:8888/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      results.tests.connectivity = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      results.tests.connectivity = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed'
      };
    }

    // Test 2: Check if it's a mixed content issue
    results.tests.mixedContent = {
      issue: window.location.protocol === 'https:',
      currentProtocol: window.location.protocol,
      serverProtocol: 'http:',
      solution: 'Server needs HTTPS or use HTTP version of app'
    };

    // Test 3: Check CORS
    results.tests.cors = {
      note: 'CORS may be blocking browser requests',
      solution: 'Server needs to allow browser origins'
    };

    setDiagnostics(results);
    setTesting(false);
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">🔬 Server Diagnostics</h3>
          <Button onClick={runDiagnostics} disabled={testing} variant="outline">
            {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run Tests"}
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="font-medium text-red-400">Critical Issues Found</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Mixed Content Security Block (HTTPS → HTTP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span>Server Connectivity: {diagnostics.tests.connectivity?.success ? 'OK' : 'FAILED'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-2">🔧 Solutions</h4>
              <div className="space-y-1 text-sm text-blue-300">
                <p>1. <strong>For immediate testing:</strong> Access your app via HTTP (not HTTPS)</p>
                <p>2. <strong>For production:</strong> Enable HTTPS on your DigitalOcean droplet</p>
                <p>3. <strong>Check server:</strong> SSH to 67.205.179.77 and verify server is running</p>
                <p>4. <strong>Firewall:</strong> Ensure ports 8888 and 1935 are open</p>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <h4 className="font-medium text-amber-400 text-sm">⚠️ Current Status</h4>
              <p className="text-xs text-amber-300 mt-1">
                Your browser cannot connect to the HTTP server due to security restrictions. 
                OBS should still work directly with the RTMP server.
              </p>
            </div>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
