
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Code, Copy, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { streamingService } from "@/services/streamingService";

export const FrontendConfiguration = () => {
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkServerStatus = async () => {
    setChecking(true);
    try {
      console.log('FrontendConfiguration: Checking server status...');
      const status = await streamingService.getServerStatus();
      setServerStatus(status);
      console.log('FrontendConfiguration: Server status result:', status);
      
      // Try to get more debug info
      try {
        const response = await fetch('https://nodejs-production-aa37f.up.railway.app/test');
        if (response.ok) {
          const debug = await response.json();
          setDebugInfo(debug);
          console.log('FrontendConfiguration: Debug info:', debug);
        }
      } catch (debugError) {
        console.log('FrontendConfiguration: Debug request failed:', debugError);
      }
    } catch (error) {
      console.error('FrontendConfiguration: Failed to check server status:', error);
      setServerStatus({ available: false, url: 'https://nodejs-production-aa37f.up.railway.app' });
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

  const testEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(`https://nodejs-production-aa37f.up.railway.app${endpoint}`);
      const text = await response.text();
      console.log(`Test ${endpoint}:`, response.status, text);
      toast.info(`${endpoint}: ${response.status} - Check console for details`);
    } catch (error) {
      console.error(`Test ${endpoint} failed:`, error);
      toast.error(`${endpoint}: Failed - Check console for details`);
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
          Streaming Server Status
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
            Check Status
          </Button>
          
          <Button
            onClick={() => window.open('https://nodejs-production-aa37f.up.railway.app/health', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open Health
          </Button>
        </div>
      </div>
      
      {checking ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
          <p className="text-blue-400">Checking streaming server status...</p>
        </div>
      ) : serverStatus?.available ? (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
            <p className="text-sm text-green-400 font-medium mb-2">✅ Streaming server is online and ready!</p>
            <div className="space-y-1 text-sm">
              <p>• <strong>Server URL:</strong> {serverStatus.url}</p>
              <p>• <strong>Health Check:</strong> Passing ✓</p>
              <p>• <strong>API Endpoints:</strong> Available ✓</p>
              {debugInfo && (
                <>
                  <p>• <strong>Server Time:</strong> {debugInfo.timestamp}</p>
                  <p>• <strong>Port:</strong> {debugInfo.port}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Production URLs (automatically configured):</Label>
              <div className="bg-slate-800 p-3 rounded font-mono text-sm mt-2">
                <div className="space-y-1">
                  <div>SERVER_URL={serverStatus.url}</div>
                  <div>RTMP_URL=rtmp://nodejs-production-aa37f.up.railway.app/live</div>
                  <div>HLS_BASE_URL={serverStatus.url}</div>
                </div>
              </div>
              <Button 
                onClick={() => copyToClipboard(`SERVER_URL=${serverStatus.url}
RTMP_URL=rtmp://nodejs-production-aa37f.up.railway.app/live
HLS_BASE_URL=${serverStatus.url}`, 'Production URLs')}
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Production URLs
              </Button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
            <h4 className="font-medium text-blue-400 mb-2">🎯 Next Steps:</h4>
            <div className="text-sm space-y-1">
              <p>1. ✅ Streaming server deployed and online</p>
              <p>2. ✅ Frontend configured for production</p>
              <p>3. 🔄 Go to Live Stream tab to generate a stream key</p>
              <p>4. 🎬 Start streaming from OBS Studio</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
            <p className="text-red-400 font-medium mb-2">❌ Streaming server is not responding</p>
            <div className="space-y-1 text-sm">
              <p>• <strong>Expected URL:</strong> https://nodejs-production-aa37f.up.railway.app</p>
              <p>• <strong>Health endpoint:</strong> /health</p>
              <p>• <strong>Status:</strong> Not accessible</p>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3">
            <h4 className="font-medium text-orange-400 mb-2">🔧 Debug Tests:</h4>
            <div className="text-sm space-y-2">
              <p>Click these buttons to test specific endpoints:</p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => testEndpoint('/')} 
                  variant="outline" 
                  size="sm"
                >
                  Test Root
                </Button>
                <Button 
                  onClick={() => testEndpoint('/health')} 
                  variant="outline" 
                  size="sm"
                >
                  Test Health
                </Button>
                <Button 
                  onClick={() => testEndpoint('/test')} 
                  variant="outline" 
                  size="sm"
                >
                  Test Debug
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
            <h4 className="font-medium text-blue-400 mb-2">🚀 Railway Deployment Check:</h4>
            <div className="text-sm space-y-2">
              <p>Go to your Railway dashboard and check:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Service is deployed and running (should show "Healthy")</li>
                <li>No build or runtime errors in logs</li>
                <li>Environment PORT is automatically set</li>
                <li>Deployment completed successfully</li>
              </ul>
              <div className="mt-2 space-y-1">
                <p className="font-medium">Direct links to test:</p>
                <a 
                  href="https://nodejs-production-aa37f.up.railway.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  → Test root endpoint
                </a>
                <a 
                  href="https://nodejs-production-aa37f.up.railway.app/health" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  → Test health endpoint
                </a>
                <a 
                  href="https://nodejs-production-aa37f.up.railway.app/test" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block"
                >
                  → Test debug endpoint
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
};
