
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";

import { SimpleOBSSetup } from "./SimpleOBSSetup";
import { Play, AlertTriangle } from "lucide-react";

export const StreamingTestPanel = () => {
  const { streamConfig, generateStreamKey, isLoading } = useRealTimeStream();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="space-y-6">
      {/* Critical Issue Alert */}
      <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Connection Issues Detected</h3>
        </div>
        <div className="space-y-2 text-sm text-red-300">
          <p>• Your app (HTTPS) cannot connect to your server (HTTP) due to browser security</p>
          <p>• This prevents the web player from working, but OBS streaming should still work</p>
          <p>• Solution: Enable HTTPS on your DigitalOcean droplet or use HTTP version of this app</p>
        </div>
        <Button 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          variant="outline" 
          size="sm" 
          className="mt-3"
        >
          {showDiagnostics ? 'Hide' : 'Show'} Full Diagnostics
        </Button>
      </div>

      {showDiagnostics && (
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium mb-3">Technical Diagnostics</h4>
          <div className="space-y-2 text-sm">
            <div>• RTMP Server: rtmp://67.205.179.77:1935/live</div>
            <div>• HTTPS API: https://67.205.179.77:3443</div>
            <div>• Connection Test: Run from your DJ Dashboard</div>
          </div>
        </div>
      )}

      {/* OBS Setup */}
      <GlassmorphicCard>
        <div className="text-center py-6">
          <h3 className="text-xl font-semibold mb-4">🎥 OBS Streaming Setup</h3>
          <p className="text-muted-foreground mb-6">
            Generate your stream key and configure OBS. The RTMP connection should work even if the web preview doesn't.
          </p>
          
          {!streamConfig ? (
            <Button 
              onClick={generateStreamKey}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              <Play className="mr-2 h-5 w-5" />
              {isLoading ? 'Generating...' : 'Generate Stream Key'}
            </Button>
          ) : (
            <div className="text-left">
              <SimpleOBSSetup />
            </div>
          )}
        </div>
      </GlassmorphicCard>

      {/* Next Steps */}
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <h4 className="font-medium text-green-400 mb-2">✅ What Should Work</h4>
        <div className="space-y-1 text-sm text-green-300">
          <p>• OBS can connect directly to rtmp://67.205.179.77:1935/live</p>
          <p>• Stream key generation and storage</p>
          <p>• RTMP streaming from OBS to your server</p>
        </div>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <h4 className="font-medium text-amber-400 mb-2">⚠️ What Won't Work (Until Fixed)</h4>
        <div className="space-y-1 text-sm text-amber-300">
          <p>• Web-based stream preview (mixed content security)</p>
          <p>• Real-time viewer count updates</p>
          <p>• Browser-based stream testing</p>
        </div>
      </div>
    </div>
  );
};
