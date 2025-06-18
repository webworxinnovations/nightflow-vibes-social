
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { streamingService } from "@/services/streamingService";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Trash2,
  ExternalLink,
  Play,
  Users,
  Timer,
  Activity,
  Server,
  AlertCircle,
  CheckCircle,
  Cloud,
  Monitor
} from "lucide-react";
import { toast } from "sonner";

export const StreamKeyManager = () => {
  const { 
    streamConfig, 
    streamStatus, 
    isLoading,
    generateStreamKey, 
    revokeStreamKey, 
    isLive, 
    viewerCount,
    duration,
    bitrate
  } = useRealTimeStream();
  
  const [showKey, setShowKey] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checkingServer, setCheckingServer] = useState(true);

  // Check streaming server status on mount
  useEffect(() => {
    const checkServer = async () => {
      setCheckingServer(true);
      try {
        const status = await streamingService.getServerStatus();
        setServerStatus(status);
      } catch (error) {
        setServerStatus({ available: false, url: 'Unknown' });
      } finally {
        setCheckingServer(false);
      }
    };

    checkServer();
    // Check every 30 seconds
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const isProduction = window.location.hostname !== 'localhost';

  return (
    <div className="space-y-6">
      {/* Server Status */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            Streaming Server Status
          </h3>
          
          {checkingServer ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted border-t-white rounded-full animate-spin"></div>
              Checking...
            </div>
          ) : serverStatus?.available ? (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
              Online
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-4 w-4" />
              Offline
            </div>
          )}
        </div>

        {!checkingServer && (
          <div className={`p-4 rounded-lg border ${
            serverStatus?.available 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            {serverStatus?.available ? (
              <div className="space-y-2">
                <p className="text-green-400 font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Streaming infrastructure is online and ready
                </p>
                <p className="text-sm text-muted-foreground">
                  RTMP server accepting connections • HLS delivery active • WebSocket status updates enabled
                </p>
                <p className="text-xs text-muted-foreground">
                  Server: {serverStatus.url}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-red-400 font-medium">
                  Streaming server not available
                </p>
                {isProduction ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      The streaming infrastructure needs to be deployed. This is required for OBS integration.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                      <p className="text-blue-400 font-medium mb-2">Quick Deploy Options:</p>
                      <div className="text-sm space-y-1">
                        <p>• <strong>Railway:</strong> Deploy server/ folder to Railway (recommended)</p>
                        <p>• <strong>DigitalOcean:</strong> App Platform deployment</p>
                        <p>• <strong>Heroku:</strong> Container deployment</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        See server/DEPLOYMENT.md for detailed instructions
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Local development server not running. Start it with:
                    </p>
                    <div className="bg-slate-800 p-2 rounded font-mono text-sm">
                      cd server && npm install && npm start
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </GlassmorphicCard>

      {/* Stream Configuration */}
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
            {/* Stream Status */}
            <div className={`p-3 rounded-lg border ${
              isLive 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isLive ? '🔴 Broadcasting Live' : '📡 Ready to Stream'}
                  </p>
                  <p className="text-sm opacity-80">
                    {isLive 
                      ? `Live for ${formatTime(duration)} with ${viewerCount} viewers`
                      : 'Configure OBS with the settings below and start streaming'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* OBS Configuration */}
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

              <div className="space-y-2">
                <Label>Viewer URL (HLS)</Label>
                <div className="flex gap-2">
                  <Input
                    value={streamConfig.hlsUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(streamConfig.hlsUrl, 'Viewer URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => window.open(streamConfig.hlsUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateStreamKey}
                variant="outline"
                className="flex-1"
                disabled={isLoading || !serverStatus?.available}
              >
                {isLoading ? 'Generating...' : 'Generate New Key'}
              </Button>
              <Button
                onClick={revokeStreamKey}
                variant="destructive"
                size="sm"
                disabled={isLive}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {isLive && (
              <p className="text-sm text-orange-400">
                ⚠️ Cannot revoke stream key while live
              </p>
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
              onClick={generateStreamKey} 
              disabled={isLoading || !serverStatus?.available}
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Stream Key'}
            </Button>
            {!serverStatus?.available && (
              <p className="text-sm text-red-400 mt-2">
                Streaming server must be online to generate keys
              </p>
            )}
          </div>
        )}
      </GlassmorphicCard>

      {/* OBS Setup Instructions */}
      <GlassmorphicCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          OBS Studio Setup Guide
        </h3>
        
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-3">Professional DJ Streaming Setup:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open OBS Studio and go to <code className="bg-muted px-1 rounded">Settings → Stream</code></li>
              <li>Set Service to <code className="bg-muted px-1 rounded">Custom...</code></li>
              <li>Copy and paste the <strong>RTMP Server URL</strong> above into the Server field</li>
              <li>Copy and paste the <strong>Stream Key</strong> above into the Stream Key field</li>
              <li>Click <code className="bg-muted px-1 rounded">Apply</code> then <code className="bg-muted px-1 rounded">OK</code></li>
              <li>Set up your scenes with cameras, audio sources, and overlays</li>
              <li>Click <code className="bg-muted px-1 rounded">Start Streaming</code> in OBS</li>
              <li>Your stream will automatically go live on Nightflow! 🎵</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium">🎛️ What DJs can stream:</h5>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Multiple camera angles (booth, crowd, equipment)</li>
                <li>High-quality audio from DJ mixer</li>
                <li>Custom overlays and graphics</li>
                <li>Smooth scene transitions</li>
                <li>Visual effects and lighting</li>
                <li>Chat integration</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">📺 Audience experience:</h5>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Professional broadcast quality</li>
                <li>Real-time viewer count</li>
                <li>Mobile-responsive viewing</li>
                <li>Adaptive video quality</li>
                <li>Low-latency streaming</li>
                <li>Social features and tips</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-sm text-green-400">
              <strong>Pro Tip:</strong> Test your setup before events! Use multiple scenes in OBS to switch between 
              camera angles, and ensure your audio levels are properly configured for the best viewer experience.
            </p>
          </div>

          {!serverStatus?.available && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <p className="text-sm text-orange-400">
                <strong>Note:</strong> The streaming server needs to be deployed before DJs can go live. 
                Contact your admin to set up the streaming infrastructure.
              </p>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
