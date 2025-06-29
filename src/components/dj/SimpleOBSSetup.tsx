
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useStreamKey } from "@/hooks/useStreamKey";

export const SimpleOBSSetup = () => {
  const { streamKey, generateStreamKey, rtmpUrl } = useStreamKey();
  const [showKey, setShowKey] = useState(false);

  const handleGenerateStreamKey = async () => {
    try {
      await generateStreamKey();
      toast.success('✅ Stream key generated! Copy the settings below into OBS.');
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const formatStreamKey = (key: string) => {
    if (!showKey && key) {
      return `${key.slice(0, 8)}${'•'.repeat(Math.max(0, key.length - 12))}${key.slice(-4)}`;
    }
    return key;
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">OBS Streaming Setup</h3>
          </div>

          {/* Stream Key Generation */}
          <div className="space-y-4">
            <Button
              onClick={handleGenerateStreamKey}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Generate Stream Key
            </Button>

            {streamKey && (
              <>
                {/* RTMP URL for OBS */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-blue-400">
                    📺 OBS Server URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={rtmpUrl || "rtmp://67.205.179.77:1935/live"}
                      readOnly
                      className="font-mono text-sm bg-blue-500/10 border-blue-500/20 text-blue-300"
                    />
                    <Button
                      onClick={() => copyToClipboard(rtmpUrl || "rtmp://67.205.179.77:1935/live", "Server URL")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-400">
                    📝 Copy this into OBS Settings → Stream → Server
                  </p>
                </div>

                {/* Stream Key */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-green-400">
                    🔑 Stream Key
                  </Label>
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
                  <p className="text-xs text-green-400">
                    📝 Copy this into OBS Settings → Stream → Stream Key
                  </p>
                </div>

                {/* OBS Instructions */}
                <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
                  <h4 className="font-medium text-slate-300 mb-3">📋 OBS Setup Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>Open OBS Studio</li>
                    <li>Go to Settings → Stream</li>
                    <li>Service: Select "Custom..."</li>
                    <li>Server: {rtmpUrl || "rtmp://67.205.179.77:1935/live"}</li>
                    <li>Stream Key: {streamKey.slice(0, 12)}...</li>
                    <li>Click Apply → OK</li>
                    <li>Click "Start Streaming" in OBS</li>
                    <li>Your stream will appear in NightFlow!</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};
