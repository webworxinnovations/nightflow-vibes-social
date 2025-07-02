
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { 
  Server,
  Wifi,
  Cloud,
  CheckCircle
} from "lucide-react";

interface ServerStatusPanelProps {
  onStatusChange?: (status: { available: boolean; url: string } | null) => void;
}

export const ServerStatusPanel = ({ onStatusChange }: ServerStatusPanelProps) => {
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checkingServer, setCheckingServer] = useState(true);

  const checkServerStatus = async () => {
    setCheckingServer(true);
    console.log('🔍 Checking DigitalOcean droplet status at 67.205.179.77:8888...');
    
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
        console.log('✅ DigitalOcean droplet confirmed operational');
      } else {
        console.log('⚠️ DigitalOcean droplet responding but with issues');
      }
    } catch (error) {
      console.error('❌ DigitalOcean droplet connectivity failed:', error);
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
          DigitalOcean Droplet Status (67.205.179.77:8888)
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
            {checkingServer ? 'Checking...' : 'Test Connection'}
          </Button>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${serverStatus?.available ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div className="space-y-3">
          <p className={`font-medium flex items-center gap-2 ${serverStatus?.available ? 'text-green-400' : 'text-red-400'}`}>
            <Cloud className="h-4 w-4" />
            {serverStatus?.available ? '✅ Droplet streaming infrastructure operational' : '❌ Droplet appears to be offline'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-blue-400 font-medium">RTMP Server:</p>
              <p className="text-muted-foreground">Port 1935 - For OBS streaming</p>
            </div>
            <div className="space-y-1">
              <p className="text-green-400 font-medium">HLS Streaming:</p>
              <p className="text-muted-foreground">Port 8888 - For web playback</p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-400 font-medium">WebSocket:</p>
              <p className="text-muted-foreground">Port 8888 - Real-time status</p>
            </div>
            <div className="space-y-1">
              <p className="text-orange-400 font-medium">HTTP API:</p>
              <p className="text-muted-foreground">Port 8888 - Stream management</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-muted/20">
            <p className="text-sm text-muted-foreground">
              <strong>Droplet IP:</strong> 67.205.179.77:8888
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>OBS Server URL:</strong> rtmp://67.205.179.77:1935/live
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong> {serverStatus?.available ? 'Ready for OBS streaming' : 'Droplet needs to be started'}
            </p>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
