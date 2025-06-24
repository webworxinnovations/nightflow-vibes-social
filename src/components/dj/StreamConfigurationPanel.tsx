
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { RTMPDiagnostics } from "./RTMPDiagnostics";
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
  AlertCircle,
  AlertTriangle
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
  const [showDiagnostics, setShowDiagnostics] = useState(false);

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

  // Extract server URL without /live for OBS
  const getObsServerUrl = (rtmpUrl: string) => {
    return rtmpUrl.replace('/live', '');
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            Stream Configuration
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

        {/* Server Status Alert */}
        {!serverAvailable && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400 mb-2">Server Issue Detected</h4>
                <p className="text-sm text-muted-foreground">
                  The RTMP streaming server is not responding. This is why OBS shows "Failed to connect to server". 
                  Use the diagnostics tool below to troubleshoot.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OBS Setup Instructions */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-2">OBS Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>In OBS: Go to Settings → Stream</li>
                <li>Service: Select "Custom..."</li>
                <li>Server: Copy the "OBS Server URL" below (WITHOUT /live at the end)</li>
                <li>Stream Key: Copy your stream key</li>
                <li>Click "Apply" → "OK" → "Start Streaming"</li>
              </ol>
            </div>
          </div>
        </div>

        {streamConfig ? (
          <div className="space-y-4">
            <div className="space-y-4">
              {/* OBS Server URL - Clear and separate */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  OBS Server URL 
                  <span className="text-xs text-orange-400 ml-2">(⚠️ Do NOT include /live)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={getObsServerUrl(streamConfig.rtmpUrl)}
                    readOnly
                    className="font-mono text-sm bg-green-500/10 border-green-500/20"
                  />
                  <Button
                    onClick={() => copyToClipboard(getObsServerUrl(streamConfig.rtmpUrl), 'OBS Server URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✅ This is the correct URL for OBS Settings → Stream → Server field
                </p>
              </div>

              {/* Stream Key */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Stream Key (Keep this private)</Label>
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

              {/* Common Mistake Warning */}
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-400 mb-1">Common OBS Mistake:</p>
                    <p className="text-muted-foreground">
                      ❌ Don't use: <code className="bg-red-500/20 px-1 rounded">{streamConfig.rtmpUrl}</code>
                    </p>
                    <p className="text-muted-foreground">
                      ✅ Use this instead: <code className="bg-green-500/20 px-1 rounded">{getObsServerUrl(streamConfig.rtmpUrl)}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostics Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg">
              <div>
                <h4 className="font-medium">RTMP Connection Diagnostics</h4>
                <p className="text-sm text-muted-foreground">
                  Test your connection and troubleshoot OBS connectivity issues
                </p>
              </div>
              <Button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                variant="outline"
                size="sm"
              >
                {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onGenerateKey}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate New Stream Key'}
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
            <h4 className="font-medium mb-2">Ready to Stream</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your stream configuration to get started
            </p>
            <Button 
              onClick={onGenerateKey} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Setting up...' : 'Generate Stream Configuration'}
            </Button>
          </div>
        )}
      </GlassmorphicCard>

      {/* RTMP Diagnostics Panel */}
      {showDiagnostics && streamConfig && (
        <RTMPDiagnostics
          rtmpUrl={streamConfig.rtmpUrl}
          serverUrl="https://nightflow-vibes-social-production.up.railway.app"
          streamKey={streamConfig.streamKey}
        />
      )}
    </div>
  );
};
