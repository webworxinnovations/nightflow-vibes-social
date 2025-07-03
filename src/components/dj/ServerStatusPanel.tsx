import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { 
  Server,
  Wifi,
  Cloud,
  CheckCircle,
  Shield
} from "lucide-react";

interface ServerStatusPanelProps {
  onStatusChange?: (status: { available: boolean; url: string } | null) => void;
}

export const ServerStatusPanel = ({ onStatusChange }: ServerStatusPanelProps) => {
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checkingServer, setCheckingServer] = useState(true);

  const checkServerStatus = async () => {
    setCheckingServer(true);
    console.log('🔍 Testing HTTP server on port 8888...');
    
    try {
      const response = await fetch('http://67.205.179.77:8888/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      const status = {
        available: response.ok,
        url: 'http://67.205.179.77:8888'
      };
      
      setServerStatus(status);
      onStatusChange?.(status);
      
      if (response.ok) {
        console.log('✅ HTTP server confirmed operational on port 8888');
      } else {
        console.log('⚠️ HTTP server responding but with issues');
      }
    } catch (error) {
      console.error('❌ HTTP server connectivity failed:', error);
      const status = { available: false, url: 'http://67.205.179.77:8888' };
      setServerStatus(status);
      onStatusChange?.(status);
    }
    
    setCheckingServer(false);
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Server className="h-5 w-5" />
          <Cloud className="h-4 w-4 text-blue-400" />
          HTTP Server Status (Port 8888)
        </h3>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${serverStatus?.available ? 'text-green-500' : 'text-red-500'}`}>
            <Wifi className="h-4 w-4" />
            {serverStatus?.available ? 'Online' : 'Offline'}
          </div>
          
          <Button 
            onClick={checkServerStatus} 
            disabled={checkingServer}
            variant="outline"
            size="sm"
          >
            {checkingServer ? 'Testing...' : 'Test HTTP Connection'}
          </Button>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${serverStatus?.available ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div className="space-y-3">
          <p className={`font-medium flex items-center gap-2 ${serverStatus?.available ? 'text-green-400' : 'text-red-400'}`}>
            <Cloud className="h-4 w-4" />
            {serverStatus?.available ? '✅ HTTP streaming infrastructure operational' : '❌ HTTP server appears to be offline'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-blue-400 font-medium">RTMP Server:</p>
              <p className="text-muted-foreground">Port 1935 - For OBS streaming</p>
            </div>
            <div className="space-y-1">
              <p className="text-green-400 font-medium">HTTP Streaming:</p>
              <p className="text-muted-foreground">Port 8888 - Web playback</p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-400 font-medium">WebSocket:</p>
              <p className="text-muted-foreground">Port 8888 - Real-time status</p>
            </div>
            <div className="space-y-1">
              <p className="text-orange-400 font-medium">HTTP API:</p>
              <p className="text-muted-foreground">Port 8888 - Server management</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-muted/20">
            <p className="text-sm text-muted-foreground">
              <strong>HTTP API:</strong> http://67.205.179.77:8888
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>OBS Server URL:</strong> rtmp://67.205.179.77:1935/live
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong> {serverStatus?.available ? 'Ready for streaming!' : 'Testing HTTP connection...'}
            </p>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
