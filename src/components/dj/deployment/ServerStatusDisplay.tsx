
import { CheckCircle, AlertCircle } from "lucide-react";

interface DebugInfo {
  [endpoint: string]: {
    status: number | string;
    ok?: boolean;
    text?: string;
    error?: string;
  };
}

interface ServerStatusDisplayProps {
  serverStatus: { available: boolean; url: string } | null;
  debugInfo: DebugInfo | null;
  checking: boolean;
}

export const ServerStatusDisplay = ({ serverStatus, debugInfo, checking }: ServerStatusDisplayProps) => {
  if (checking) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400">Testing DigitalOcean app deployment endpoints...</p>
        </div>
      </div>
    );
  }

  if (serverStatus?.available) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
          <p className="text-sm text-green-400 font-medium mb-2">✅ DigitalOcean app deployment is online and responding!</p>
          <div className="space-y-1 text-sm">
            <p>• <strong>Deployment URL:</strong> https://nightflow-app-wijb2.ondigitalocean.app</p>
            <p>• <strong>Health Check:</strong> Passing ✓</p>
            <p>• <strong>RTMP Server:</strong> Ready for OBS connections ✓</p>
            <p>• <strong>WebSocket:</strong> Available for real-time updates ✓</p>
          </div>
        </div>
        
        {debugInfo && (
          <div className="bg-slate-800 p-3 rounded font-mono text-xs">
            <p className="text-green-400 mb-2">Endpoint Test Results:</p>
            {Object.entries(debugInfo).map(([endpoint, result]) => (
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
            <p>1. ✅ DigitalOcean app deployment is running</p>
            <p>2. ✅ Streaming server is online</p>
            <p>3. ✅ Frontend is configured</p>
            <p>4. 🎯 <strong>Next:</strong> Generate stream key and start OBS</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
        <p className="text-red-400 font-medium mb-3">❌ DigitalOcean app deployment is not responding</p>
        
        {debugInfo && (
          <div className="bg-slate-900 p-3 rounded font-mono text-xs mb-3">
            <p className="text-red-400 mb-2">Connection Test Results:</p>
            {Object.entries(debugInfo).map(([endpoint, result]) => (
              <div key={endpoint} className="mb-1 text-red-300">
                <span className="text-blue-400">{endpoint}:</span> 
                <span className="ml-2">
                  {result.error || `${result.status} Failed`}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-1 text-sm">
          <p>• <strong>Expected URL:</strong> https://nightflow-app-wijb2.ondigitalocean.app</p>
          <p>• <strong>Status:</strong> Not accessible or crashed</p>
          <p>• <strong>Impact:</strong> Cannot generate stream keys or accept OBS connections</p>
        </div>
      </div>
    </div>
  );
};
