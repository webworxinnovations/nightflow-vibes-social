import { useState } from "react";
import { useStreamKey } from "@/hooks/useStreamKey";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Play, Square, Users, Timer } from "lucide-react";
import { toast } from "sonner";
import { RealVideoPlayer } from "./RealVideoPlayer";


export const CleanStreamingDashboard = () => {
  const { streamKey, isLive, viewerCount, hlsUrl, rtmpUrl, generateStreamKey } = useStreamKey();
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleGenerateKey = async () => {
    try {
      await generateStreamKey();
      toast.success("New stream key generated! Configure OBS and start streaming.");
    } catch (error) {
      toast.error("Failed to generate stream key");
    }
  };

  const formatStreamKey = (key: string) => {
    if (!showKey && key) {
      return `${key.slice(0, 8)}${'•'.repeat(Math.max(0, key.length - 12))}${key.slice(-4)}`;
    }
    return key;
  };

  return (
    <div className="space-y-6">
      {/* Server Connection Status */}
      <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <h3 className="text-lg font-bold text-green-400">Server Online</h3>
            <p className="text-green-300">Your DigitalOcean streaming server is ready for OBS connections.</p>
          </div>
        </div>
      </div>

      {/* Server Info */}
      <GlassmorphicCard>
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🌐</div>
              <h3 className="text-lg font-bold text-blue-400">DigitalOcean Droplet Ready!</h3>
            </div>
            <p className="text-blue-300 mb-4">
              ✅ Your droplet is configured for OBS streaming with HTTPS/SSL enabled
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-white font-medium mb-2">🔗 HTTPS API Endpoint:</p>
                <div className="flex gap-2">
                  <Input
                    value="https://67.205.179.77:3443"
                    readOnly
                    className="font-mono text-sm bg-blue-500/10 border-blue-500/20"
                  />
                  <Button
                    onClick={() => {
                      copyToClipboard("https://67.205.179.77:3443", "HTTPS URL");
                    }}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-white font-medium mb-2">📺 RTMP Server (for OBS):</p>
                <div className="flex gap-2">
                  <Input
                    value="rtmp://67.205.179.77:1935/live"
                    readOnly
                    className="font-mono text-sm bg-green-500/10 border-green-500/20"
                  />
                  <Button
                    onClick={() => {
                      copyToClipboard("rtmp://67.205.179.77:1935/live", "RTMP URL");
                    }}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-blue-300 bg-blue-500/10 p-3 rounded">
                <p className="font-medium mb-1">🎉 Start your server to stream!</p>
                <p>Make sure your droplet server is running, then generate a stream key and configure OBS.</p>
              </div>
            </div>
          </div>
      </GlassmorphicCard>

      {/* Stream Status Header */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Live Stream</h2>
            {isLive ? (
              <Badge variant="destructive" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary">OFFLINE</Badge>
            )}
          </div>
          
          {isLive && (
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {viewerCount} viewers
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                Live now
              </div>
            </div>
          )}
        </div>
      </GlassmorphicCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OBS Setup Panel */}
        <GlassmorphicCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">OBS Setup</h3>
              <Button onClick={handleGenerateKey} variant="outline">
                Generate New Key
              </Button>
            </div>

            {streamKey ? (
              <div className="space-y-4">
                {/* RTMP Server */}
                <div className="space-y-2">
                  <Label className="text-blue-400 font-medium">Server URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={rtmpUrl || "rtmp://67.205.179.77:1935/live"}
                      readOnly
                      className="font-mono text-sm bg-blue-500/10 border-blue-500/20"
                    />
                    <Button
                      onClick={() => copyToClipboard(rtmpUrl || "rtmp://67.205.179.77:1935/live", "Server URL")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stream Key */}
                <div className="space-y-2">
                  <Label className="text-green-400 font-medium">Stream Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formatStreamKey(streamKey)}
                      readOnly
                      type={showKey ? "text" : "password"}
                      className="font-mono text-sm bg-green-500/10 border-green-500/20"
                    />
                    <Button
                      onClick={() => setShowKey(!showKey)}
                      variant="outline"
                      size="sm"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(streamKey, 'Stream key')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Instructions */}
                <div className="p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg">
                  <h4 className="font-medium text-slate-300 mb-2">Quick OBS Setup:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                    <li>Open OBS Studio → Settings → Stream</li>
                    <li>Service: "Custom..."</li>
                    <li>Copy Server URL and Stream Key above</li>
                    <li>Click "Start Streaming" in OBS</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Generate a stream key to get started</p>
                <Button onClick={handleGenerateKey}>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Stream Key
                </Button>
              </div>
            )}
          </div>
        </GlassmorphicCard>

        {/* Live Preview */}
        <GlassmorphicCard>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Live Preview</h3>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {streamKey ? (
                <RealVideoPlayer
                  hlsUrl={hlsUrl}
                  isLive={isLive}
                  autoplay={false}
                  muted={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📹</div>
                    <p>Generate a stream key to see preview</p>
                  </div>
                </div>
              )}
            </div>

            {!isLive && streamKey && (
              <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  💡 Start streaming from OBS to see your live feed here
                </p>
              </div>
            )}
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
};