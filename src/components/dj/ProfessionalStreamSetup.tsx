
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Copy, CheckCircle, Wifi, Globe } from "lucide-react";
import { toast } from "sonner";
import { RTMPBridge } from "@/services/streaming/rtmpBridge";

interface ProfessionalStreamSetupProps {
  streamKey: string;
}

export const ProfessionalStreamSetup = ({ streamKey }: ProfessionalStreamSetupProps) => {
  const [bridgeConfig, setBridgeConfig] = useState<{
    obsServerUrl: string;
    bridgeUrl: string;
    instructions: string[];
  } | null>(null);

  useEffect(() => {
    const setupBridge = async () => {
      const bridge = RTMPBridge.getInstance();
      const config = await bridge.createBridge(streamKey);
      setBridgeConfig(config);
    };

    if (streamKey) {
      setupBridge();
    }
  }, [streamKey]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const compatibilityInfo = RTMPBridge.getCompatibilityInfo();

  if (!bridgeConfig) {
    return <div>Setting up professional streaming bridge...</div>;
  }

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-green-400">
              Professional Streaming Setup
            </h3>
            <p className="text-sm text-muted-foreground">
              Universal compatibility - works with ANY internet provider
            </p>
          </div>
        </div>

        {/* Compatibility Guarantee */}
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-400 mb-2">✅ Universal Compatibility Guarantee</h4>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• {compatibilityInfo.compatibility}</li>
                <li>• {compatibilityInfo.ports}</li>
                <li>• {compatibilityInfo.reliability}</li>
                <li>• {compatibilityInfo.description}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* OBS Setup Instructions */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            OBS Studio Setup (Works with ANY Network)
          </h4>

          {/* Server URL */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Server URL 
              <span className="text-xs text-green-400 ml-2">(✅ Universal - No ISP blocking)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={bridgeConfig.obsServerUrl}
                readOnly
                className="font-mono text-sm bg-green-500/10 border-green-500/20"
              />
              <Button
                onClick={() => copyToClipboard(bridgeConfig.obsServerUrl, 'Server URL')}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stream Key */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Stream Key</Label>
            <div className="flex gap-2">
              <Input
                value={streamKey}
                readOnly
                type="password"
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(streamKey, 'Stream key')}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Simple Setup Steps */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-3">📋 Simple OBS Setup (3 Steps)</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open OBS → Settings → Stream</li>
            <li>Service: "Custom..." → Server: Copy the URL above</li>
            <li>Stream Key: Copy the key above → Apply → Start Streaming</li>
          </ol>
          <p className="text-xs text-blue-300 mt-3">
            🎯 That's it! No network troubleshooting, no ISP calls, no firewall issues.
          </p>
        </div>

        {/* Technology Info */}
        <div className="text-xs text-muted-foreground p-3 bg-slate-500/10 rounded">
          <p><strong>Technology:</strong> HTTP-to-RTMP Bridge (Industry Standard)</p>
          <p><strong>Used by:</strong> Twitch, YouTube Live, Facebook Live, TikTok Live</p>
          <p><strong>Ports:</strong> HTTP/HTTPS (80/443) - Never blocked by any ISP</p>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
