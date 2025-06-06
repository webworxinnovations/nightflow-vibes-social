
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useStreamKey } from "@/hooks/useStreamKey";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Trash2,
  ExternalLink,
  Play,
  Users,
  Timer
} from "lucide-react";
import { toast } from "sonner";

export const StreamKeyManager = () => {
  const { streamData, generateStreamKey, revokeStreamKey, isLive, viewerCount } = useStreamKey();
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

  return (
    <div className="space-y-6">
      {/* Stream Status */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            Nightflow Stream Key
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
            </div>
          )}
        </div>

        {streamData.streamKey ? (
          <div className="space-y-4">
            {/* RTMP URL */}
            <div className="space-y-2">
              <Label>RTMP Server URL</Label>
              <div className="flex gap-2">
                <Input
                  value={streamData.rtmpUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(streamData.rtmpUrl, 'RTMP URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stream Key */}
            <div className="space-y-2">
              <Label>Stream Key</Label>
              <div className="flex gap-2">
                <Input
                  value={formatStreamKey(streamData.streamKey)}
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
                  onClick={() => copyToClipboard(streamData.streamKey, 'Stream key')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stream URL for viewers */}
            <div className="space-y-2">
              <Label>Viewer URL</Label>
              <div className="flex gap-2">
                <Input
                  value={streamData.streamUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(streamData.streamUrl, 'Viewer URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => window.open(streamData.streamUrl, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateStreamKey}
                variant="outline"
                className="flex-1"
              >
                Generate New Key
              </Button>
              <Button
                onClick={revokeStreamKey}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No Stream Key Generated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a stream key to start broadcasting from OBS
            </p>
            <Button onClick={generateStreamKey}>
              <Play className="mr-2 h-4 w-4" />
              Generate Stream Key
            </Button>
          </div>
        )}
      </GlassmorphicCard>

      {/* Instructions */}
      <GlassmorphicCard>
        <h3 className="text-lg font-semibold mb-4">How to Stream from OBS</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">Quick Setup:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Copy the RTMP URL and Stream Key above</li>
              <li>In OBS Studio, go to <code className="bg-muted px-1 rounded">Settings → Stream</code></li>
              <li>Set Service to <code className="bg-muted px-1 rounded">Custom...</code></li>
              <li>Paste the RTMP URL in Server field</li>
              <li>Paste the Stream Key in Stream Key field</li>
              <li>Click <code className="bg-muted px-1 rounded">Apply</code> then <code className="bg-muted px-1 rounded">OK</code></li>
              <li>Click <code className="bg-muted px-1 rounded">Start Streaming</code> in OBS</li>
              <li>Your stream will automatically go live on Nightflow! 🚀</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium">✅ What this enables:</h5>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Professional streaming from OBS</li>
                <li>All your camera angles and overlays</li>
                <li>Audio mixing and effects</li>
                <li>Scene transitions</li>
                <li>Recording while streaming</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium">📺 Your audience sees:</h5>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Whatever you broadcast from OBS</li>
                <li>High-quality video stream</li>
                <li>Real-time viewer count</li>
                <li>Professional production value</li>
                <li>Smooth scene changes</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <p className="text-sm text-orange-400">
              <strong>Pro Tip:</strong> Keep this stream key private! Anyone with access can broadcast to your Nightflow channel.
            </p>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};
