
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
  Monitor,
  AlertCircle
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
          Quick Stream Setup
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

      {/* Simplified Setup Instructions */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Ready to Stream in 3 Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Generate your stream key below</li>
              <li>Copy the server URL and stream key to OBS</li>
              <li>Click "Start Streaming" in OBS</li>
            </ol>
          </div>
        </div>
      </div>

      {streamConfig ? (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Server URL (Copy to OBS Settings → Stream)</Label>
              <div className="flex gap-2">
                <Input
                  value="rtmp://live.twitch.tv/live"
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard("rtmp://live.twitch.tv/live", 'Server URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This will stream to Twitch for testing. You'll need a Twitch account.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Stream Key (Use your Twitch stream key)</Label>
              <div className="flex gap-2">
                <Input
                  value={formatStreamKey(streamConfig.streamKey)}
                  readOnly
                  type={showKey ? "text" : "password"}
                  className="font-mono text-sm"
                  placeholder="Get your stream key from Twitch Creator Dashboard"
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
              <p className="text-xs text-muted-foreground">
                Go to <a href="https://dashboard.twitch.tv/settings/stream" target="_blank" className="text-blue-400 hover:underline">Twitch Creator Dashboard</a> to get your stream key
              </p>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">OBS Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open OBS Studio</li>
              <li>Go to Settings → Stream</li>
              <li>Set Service to "Custom..."</li>
              <li>Copy the Server URL above into the "Server" field</li>
              <li>Get your Twitch stream key and paste it in the "Stream Key" field</li>
              <li>Click Apply and OK</li>
              <li>Click "Start Streaming" in OBS</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onGenerateKey}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate New Session'}
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
        </div>
      ) : (
        <div className="text-center py-6">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Start Your Stream</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a session to get started with streaming
          </p>
          <Button 
            onClick={onGenerateKey} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="mr-2 h-4 w-4" />
            {isLoading ? 'Setting up...' : 'Start Streaming Session'}
          </Button>
        </div>
      )}
    </GlassmorphicCard>
  );
};
