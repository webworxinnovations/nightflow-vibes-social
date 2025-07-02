
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
    console.log('🔍 Checking HTTPS droplet status at 67.205.179.77:3443...');
    
    try {
      const response = await fetch('https://67.205.179.77:3443/health', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      const status = {
        available: response.ok,
        url: 'https://67.205.179.77:3443'
      };
      
      setServerStatus(status);
      onStatusChange?.(status);
      
      if (response.ok) {
        console.log('✅ HTTPS droplet confirmed operational');
      } else {
        console.log('⚠️ HTTPS droplet responding but with issues');
      }
    } catch (error) {
      console.error('❌ HTTPS droplet connectivity failed:', error);
      const status = { available: false, url: 'https://67.205.179.77:3443' };
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
          <Shield className="h-4 w-4 text-green-400" />
          HTTPS Droplet Status (67.205.179.77:3443)
        </h3>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${serverStatus?.available ? 'text-green-500' : 'text-red-500'}`}>
            <Wifi className="h-4 w-4" />
            {serverStatus?.available ? 'Secure Online' : 'Offline'}
          </div>
          
          <Button 
            onClick={checkServerStatus} 
            disabled={checkingServer}
            variant="outline"
            size="sm"
          >
            {checkingServer ? 'Checking...' : 'Test HTTPS Connection'}
          </Button>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${serverStatus?.available ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        <div className="space-y-3">
          <p className={`font-medium flex items-center gap-2 ${serverStatus?.available ? 'text-green-400' : 'text-red-400'}`}>
            <Cloud className="h-4 w-4" />
            <Shield className="h-4 w-4" />
            {serverStatus?.available ? '✅ Secure HTTPS streaming infrastructure operational' : '❌ HTTPS droplet appears to be offline'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-blue-400 font-medium">RTMP Server:</p>
              <p className="text-muted-foreground">Port 1935 - For OBS streaming</p>
            </div>
            <div className="space-y-1">
              <p className="text-green-400 font-medium">HTTPS Streaming:</p>
              <p className="text-muted-foreground">Port 3443 - Secure web playback</p>
            </div>
            <div className="space-y-1">
              <p className="text-purple-400 font-medium">Secure WebSocket:</p>
              <p className="text-muted-foreground">Port 3443 - Real-time status</p>
            </div>
            <div className="space-y-1">
              <p className="text-orange-400 font-medium">HTTPS API:</p>
              <p className="text-muted-foreground">Port 3443 - Secure management</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-muted/20">
            <p className="text-sm text-muted-foreground">
              <strong>HTTPS API:</strong> https://67.205.179.77:3443
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>OBS Server URL:</strong> rtmp://67.205.179.77:1935/live
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong> {serverStatus?.available ? 'Ready for secure OBS streaming' : 'HTTPS droplet needs to be started'}
            </p>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
