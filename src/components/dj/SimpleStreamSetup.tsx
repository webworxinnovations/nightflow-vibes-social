
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";

export const SimpleStreamSetup = () => {
  const [showKey, setShowKey] = useState(false);
  const { streamConfig, isLoading, generateStreamKey, revokeStreamKey, isLive, viewerCount } = useRealTimeStream();

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

  // Simple, clean OBS server URL
  const obsServerUrl = "rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live";

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">OBS Stream Setup</h3>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">LIVE • {viewerCount} viewers</span>
            </div>
          )}
        </div>

        {streamConfig ? (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 font-medium">
                ✅ Stream configuration ready! Copy these values into OBS.
              </p>
            </div>

            {/* OBS Server URL */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-blue-400">
                📹 OBS Server URL
              </Label>
              <div className="flex gap-2">
                <Input
                  value={obsServerUrl}
                  readOnly
                  className="font-mono text-sm bg-blue-500/10 border-blue-500/20"
                />
                <Button
                  onClick={() => copyToClipboard(obsServerUrl, 'Server URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-400">
                Paste this in OBS Settings → Stream → Server
              </p>
            </div>

            {/* Stream Key */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">🔑 Stream Key</Label>
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
              <p className="text-xs text-green-400">
                Paste this in OBS Settings → Stream → Stream Key
              </p>
            </div>

            {/* Quick Setup Steps */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-3">📋 OBS Setup Steps:</h4>
              <ol className="text-sm text-blue-300 space-y-2 list-decimal list-inside">
                <li>Open OBS Studio → Settings → Stream</li>
                <li>Service: Select "Custom..."</li>
                <li>Server: Paste the server URL above</li>
                <li>Stream Key: Paste your stream key</li>
                <li>Click "OK" → "Start Streaming"</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={generateStreamKey}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Generate New Key
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
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="font-medium mb-2">Ready to Stream</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your stream configuration to get started with OBS
            </p>
            <Button 
              onClick={generateStreamKey} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Setting up...' : 'Generate Stream Key'}
            </Button>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
