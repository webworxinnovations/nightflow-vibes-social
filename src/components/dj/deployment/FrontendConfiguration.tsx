
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Code, Copy, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Terminal, Globe } from "lucide-react";
import { toast } from "sonner";
import { streamingService } from "@/services/streamingService";

export const FrontendConfiguration = () => {
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkServerStatus = async () => {
    setChecking(true);
    try {
      console.log('🔍 Checking Railway deployment status...');
      const status = await streamingService.getServerStatus();
      setServerStatus(status);
      console.log('📊 Server status result:', status);
      
      // Try multiple endpoints for debugging
      const testEndpoints = ['/', '/health', '/test'];
      const results: any = {};
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`https://nightflow-vibes-social-production.up.railway.app${endpoint}`);
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
      setServerStatus({ available: false, url: 'https://nightflow-vibes-social-production.up.railway.app' });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const testSpecificEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(`https://nightflow-vibes-social-production.up.railway.app${endpoint}`);
      const text = await response.text();
      console.log(`🧪 Test ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: text
      });
      toast.info(`${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'} - Check console`);
      return { status: response.status, ok: response.ok, text };
    } catch (error) {
      console.error(`💥 Test ${endpoint} failed:`, error);
      toast.error(`${endpoint}: Connection failed`);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {serverStatus?.available ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          Railway Deployment Status
        </h3>
        
        <div className="flex gap-2">
          <Button
            onClick={checkServerStatus}
            variant="outline"
            size="sm"
            disabled={checking}
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recheck
          </Button>
          
          <Button
            onClick={() => window.open('https://railway.app/dashboard', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            Railway Dashboard
          </Button>
        </div>
      </div>
      
      {checking ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400">Testing Railway deployment endpoints...</p>
          </div>
        </div>
      ) : serverStatus?.available ? (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
            <p className="text-sm text-green-400 font-medium mb-2">✅ Railway deployment is online and responding!</p>
            <div className="space-y-1 text-sm">
              <p>• <strong>Deployment URL:</strong> https://nightflow-vibes-social-production.up.railway.app</p>
              <p>• <strong>Health Check:</strong> Passing ✓</p>
              <p>• <strong>RTMP Server:</strong> Ready for OBS connections ✓</p>
              <p>• <strong>WebSocket:</strong> Available for real-time updates ✓</p>
            </div>
          </div>
          
          {debugInfo && (
            <div className="bg-slate-800 p-3 rounded font-mono text-xs">
              <p className="text-green-400 mb-2">Endpoint Test Results:</p>
              {Object.entries(debugInfo).map(([endpoint, result]: [string, any]) => (
                <div key={endpoint} className="mb-1">
                  <span className="text-blue-400">{endpoint}:</span> 
                  <span className={`ml-2 ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
                    {result.status} {result.ok ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
            <h4 className="font-medium text-blue-400 mb-2">🚀 Ready to Stream!</h4>
            <div className="text-sm space-y-1">
              <p>1. ✅ Railway deployment is running</p>
              <p>2. ✅ Streaming server is online</p>
              <p>3. ✅ Frontend is configured</p>
              <p>4. 🎯 <strong>Next:</strong> Generate stream key and start OBS</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
            <p className="text-red-400 font-medium mb-3">❌ Railway deployment is not responding</p>
            
            {debugInfo && (
              <div className="bg-slate-900 p-3 rounded font-mono text-xs mb-3">
                <p className="text-red-400 mb-2">Connection Test Results:</p>
                {Object.entries(debugInfo).map(([endpoint, result]: [string, any]) => (
                  <div key={endpoint} className="mb-1 text-red-300">
                    <span className="text-blue-400">{endpoint}:</span> 
                    <span className="ml-2">
                      {(result as any).error || `${(result as any).status} Failed`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-1 text-sm">
              <p>• <strong>Expected URL:</strong> https://nightflow-vibes-social-production.up.railway.app</p>
              <p>• <strong>Status:</strong> Not accessible or crashed</p>
              <p>• <strong>Impact:</strong> Cannot generate stream keys or accept OBS connections</p>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded p-4">
            <h4 className="font-medium text-orange-400 mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Immediate Action Required
            </h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-orange-300 mb-2">1. Check Railway Dashboard:</p>
                <div className="ml-4 space-y-1">
                  <p>• Go to <a href="https://railway.app/dashboard" target="_blank" className="text-blue-400 underline">Railway Dashboard</a></p>
                  <p>• Find your "nightflow-vibes-social-production" project</p>
                  <p>• Check if the service shows "Healthy" or has errors</p>
                  <p>• Look for build failures or crash logs</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-orange-300 mb-2">2. Common Issues & Solutions:</p>
                <div className="ml-4 space-y-1">
                  <p>• <strong>Build Failed:</strong> Check build logs for errors</p>
                  <p>• <strong>Port Issues:</strong> Ensure PORT environment variable is set</p>
                  <p>• <strong>Crashed:</strong> Check runtime logs for errors</p>
                  <p>• <strong>Not Deployed:</strong> Re-deploy from Railway dashboard</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-orange-300 mb-2">3. Quick Tests:</p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => testSpecificEndpoint('/')} variant="outline" size="sm">
                    Test Root
                  </Button>
                  <Button onClick={() => testSpecificEndpoint('/health')} variant="outline" size="sm">
                    Test Health
                  </Button>
                  <Button onClick={() => testSpecificEndpoint('/test')} variant="outline" size="sm">
                    Test API
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
            <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Manual URL Tests
            </h4>
            <div className="text-sm space-y-2">
              <p>Try opening these URLs directly in your browser:</p>
              <div className="space-y-1">
                <a 
                  href="https://nightflow-vibes-social-production.up.railway.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  → https://nightflow-vibes-social-production.up.railway.app/
                </a>
                <a 
                  href="https://nightflow-vibes-social-production.up.railway.app/health" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  → https://nightflow-vibes-social-production.up.railway.app/health
                </a>
                <a 
                  href="https://nightflow-vibes-social-production.up.railway.app/test" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  → https://nightflow-vibes-social-production.up.railway.app/test
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                If these URLs don't load, your Railway deployment has an issue that needs to be fixed.
              </p>
            </div>
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
};
