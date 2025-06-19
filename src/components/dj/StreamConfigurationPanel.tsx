
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { RTMPConnectionTester } from "./RTMPConnectionTester";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Trash2,
  Play,
  Users,
  Timer,
  Activity,
  Monitor
} from "lucide-react";
import { toast } from "sonner";

interface StreamConfigurationPanelProps {
  streamConfig: { 
    rtmpUrl: string; 
    streamKey: string; 
    hlsUrl: string 
  } | null;
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  isLoading: boolean;
  serverAvailable: boolean;
  onGenerateKey: () => void;
  onRevokeKey: () => void;
}

export const StreamConfigurationPanel = ({
  streamConfig,
  isLive,
  viewerCount,
  duration,
  bitrate,
  isLoading,
  serverAvailable,
  onGenerateKey,
  onRevokeKey
}: StreamConfigurationPanelProps) => {
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const formatStreamKey = (key: string) => {
    if (!showKey && key) {
      return `${key.slice(0, 8)}${'•'.repeat(20)}${key.slice(-4)}`;
    }
    return key;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Key className="h-5 w-5" />
          OBS Stream Configuration
        </h3>
        
        {isLive && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              LIVE
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              {viewerCount} viewers
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-4 w-4" />
              {formatTime(duration)}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-4 w-4" />
              {(bitrate / 1000).toFixed(1)}k
            </div>
          </div>
        )}
      </div>

      {streamConfig ? (
        <div className="space-y-4">
          <RTMPConnectionTester 
            streamConfig={streamConfig}
            serverAvailable={serverAvailable}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>RTMP Server URL (for OBS)</Label>
              <div className="flex gap-2">
                <Input
                  value={streamConfig.rtmpUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(streamConfig.rtmpUrl, 'RTMP URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stream Key (for OBS)</Label>
              <div className="flex gap-2">
                <Input
                  value={formatStreamKey(streamConfig.streamKey)}
                  readOnly
                  type={showKey ? "text" : "password"}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => setShowKey(!showKey)}
                  variant="outline"
                  size="sm"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => copyToClipboard(streamConfig.streamKey, 'Stream key')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onGenerateKey}
              variant="outline"
              className="flex-1"
              disabled={isLoading || !serverAvailable}
            >
              {isLoading ? 'Generating...' : 'Generate New Key'}
            </Button>
            <Button
              onClick={onRevokeKey}
              variant="destructive"
              size="sm"
              disabled={isLive}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {!serverAvailable && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-medium">
                ⚠️ OBS Connection Issue Identified:
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The RTMP server is not responding. This is why OBS shows "Failed to connect to server". 
                The streaming infrastructure needs to be deployed or restarted.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">No Stream Key Generated</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a stream key to enable OBS broadcasting
          </p>
          <Button 
            onClick={onGenerateKey} 
            disabled={isLoading || !serverAvailable}
          >
            <Play className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate Stream Key'}
          </Button>
          {!serverAvailable && (
            <p className="text-sm text-red-400 mt-2">
              Streaming server must be online to generate keys
            </p>
          )}
        </div>
      )}
    </GlassmorphicCard>
  );
};
