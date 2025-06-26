import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { streamingService } from "@/services/streamingService";
import { 
  Server,
  Wifi,
  WifiOff,
  Cloud,
  AlertCircle
} from "lucide-react";

interface ServerStatusPanelProps {
  onStatusChange?: (status: { available: boolean; url: string } | null) => void;
}

export const ServerStatusPanel = ({ onStatusChange }: ServerStatusPanelProps) => {
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checkingServer, setCheckingServer] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkServerStatus = async () => {
    setCheckingServer(true);
    console.log('🔍 Starting comprehensive DigitalOcean server status check...');
    
    try {
      const status = await streamingService.getServerStatus();
      setServerStatus(status);
      onStatusChange?.(status);
      
      // Additional debugging tests
      const debugResults: any = {
        baseServerCheck: status,
        timestamp: new Date().toISOString()
      };

      // Test multiple endpoints
      const testEndpoints = [
        { path: '/', name: 'Root' },
        { path: '/health', name: 'Health Check' },
        { path: '/api/health', name: 'API Health' }
      ];

      for (const endpoint of testEndpoints) {
        try {
          console.log(`🧪 Testing ${endpoint.name}: ${status.url}${endpoint.path}`);
          const response = await fetch(`${status.url}${endpoint.path}`, {
            method: 'GET',
            signal: AbortSignal.timeout(10000)
          });
          
          const responseText = await response.text().catch(() => 'No response body');
          
          debugResults[endpoint.name] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText.substring(0, 500) // Limit body size
          };
          
          console.log(`✅ ${endpoint.name} result:`, debugResults[endpoint.name]);
        } catch (error) {
          debugResults[endpoint.name] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            failed: true
          };
          console.log(`❌ ${endpoint.name} failed:`, debugResults[endpoint.name]);
        }
      }

      setDebugInfo(debugResults);
      console.log('📊 Complete debug results:', debugResults);
      
    } catch (error) {
      console.error('❌ DigitalOcean server status check failed:', error);
      const fallbackStatus = { available: false, url: 'https://nightflow-app-wijb2.ondigitalocean.app' };
      setServerStatus(fallbackStatus);
      onStatusChange?.(fallbackStatus);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setCheckingServer(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Server className="h-5 w-5" />
          DigitalOcean RTMP Server Status & Diagnostics
        </h3>
        
        <div className="flex items-center gap-2">
          {checkingServer ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted border-t-white rounded-full animate-spin"></div>
              Checking...
            </div>
          ) : serverStatus?.available ? (
            <div className="flex items-center gap-2 text-green-500">
              <Wifi className="h-4 w-4" />
              Online
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <WifiOff className="h-4 w-4" />
              Offline
            </div>
          )}
          
          <Button 
            onClick={checkServerStatus} 
            disabled={checkingServer}
            variant="outline"
            size="sm"
          >
            Recheck
          </Button>
        </div>
      </div>

      {!checkingServer && (
        <div className={`p-4 rounded-lg border ${
          serverStatus?.available 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          {serverStatus?.available ? (
            <div className="space-y-3">
              <p className="text-green-400 font-medium flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                ✅ DigitalOcean RTMP streaming server is online and ready
              </p>
              <p className="text-sm text-muted-foreground">
                Server URL: {serverStatus.url}
              </p>
              
              {debugInfo && (
                <details className="mt-3">
                  <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                    🔬 Show Technical Details (for debugging OBS issues)
                  </summary>
                  <div className="mt-2 p-3 bg-slate-800 rounded text-xs font-mono space-y-2">
                    {Object.entries(debugInfo).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <strong className="text-blue-400">{key}:</strong>
                        <pre className="text-gray-300 ml-2 whitespace-pre-wrap">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-red-400 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                ❌ DigitalOcean RTMP server not responding
              </p>
              <p className="text-sm text-muted-foreground">
                This explains why OBS can't connect. The streaming infrastructure needs attention.
              </p>
              
              {debugInfo && (
                <details className="mt-3">
                  <summary className="text-sm text-orange-400 cursor-pointer">
                    🔍 Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-slate-800 rounded text-xs font-mono">
                    <pre className="text-red-300 whitespace-pre-wrap">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </GlassmorphicCard>
  );
};
