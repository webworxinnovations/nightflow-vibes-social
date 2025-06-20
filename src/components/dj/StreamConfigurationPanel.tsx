
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { RTMPConnectionTester } from "./RTMPConnectionTester";
import { StreamingAPI } from "@/services/streaming/api";
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
  TestTube
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
  const [testingConnection, setTestingConnection] = useState(false);

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

  const testRtmpConnection = async () => {
    if (!streamConfig?.streamKey) {
      toast.error('Generate a stream key first');
      return;
    }

    setTestingConnection(true);
    try {
      const result = await StreamingAPI.testRtmpConnection(streamConfig.streamKey);
      if (result.success) {
        toast.success('RTMP server is ready! Try connecting OBS now.');
      } else {
        toast.error(`RTMP test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
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
                The issue is on our server side, not with your OBS configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-400 mb-2">OBS Streaming Setup:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Generate your stream key below</li>
              <li>Copy the Server URL and Stream Key to OBS Settings → Stream</li>
              <li>Test the connection using the test button</li>
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
                  value={streamConfig.rtmpUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(streamConfig.rtmpUrl, 'Server URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stream Key (Keep this private)</Label>
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

          {/* Connection Test */}
          <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Test RTMP Connection</h4>
              <Button
                onClick={testRtmpConnection}
                disabled={testingConnection}
                variant="outline"
                size="sm"
              >
                {testingConnection ? (
                  <div className="w-4 h-4 border-2 border-muted border-t-white rounded-full animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Test if the RTMP server is ready to accept your OBS connection before starting to stream.
            </p>
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
  );
};
