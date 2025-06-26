
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { StreamingConfig } from "@/services/streaming/config";

interface StreamConfigFieldsProps {
  streamKey: string;
}

export const StreamConfigFields = ({ streamKey }: StreamConfigFieldsProps) => {
  const [showKey, setShowKey] = useState(false);

  // Get the correct URLs from StreamingConfig
  const obsServerUrl = StreamingConfig.getOBSServerUrl();
  const fullRtmpUrl = StreamingConfig.getRtmpUrl();
  const troubleshootingSteps = StreamingConfig.getTroubleshootingSteps();

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
    <div className="space-y-4">
      {/* OBS Server URL - Clear and separate */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          OBS Server URL 
          <span className="text-xs text-green-400 ml-2">(✅ Copy this exactly into OBS)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={obsServerUrl}
            readOnly
            className="font-mono text-sm bg-green-500/10 border-green-500/20"
          />
          <Button
            onClick={() => copyToClipboard(obsServerUrl, 'OBS Server URL')}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-green-400">
          ✅ This is the correct URL for OBS Settings → Stream → Server field
        </p>
      </div>

      {/* Stream Key */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Stream Key (Keep this private)</Label>
        <div className="flex gap-2">
          <Input
            value={formatStreamKey(streamKey)}
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
            onClick={() => copyToClipboard(streamKey, 'Stream key')}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection troubleshooting */}
      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-400 mb-2">🔧 If OBS shows "Failed to connect" or "Hostname not found":</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              {troubleshootingSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
            <p className="text-xs text-orange-400 mt-2">
              📶 Most connection issues are caused by network/ISP blocking RTMP traffic on port 1935
            </p>
          </div>
        </div>
      </div>

      {/* Success setup confirmation */}
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Wifi className="h-4 w-4 text-green-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-400 mb-1">✅ Quick Setup Check:</p>
            <p className="text-muted-foreground">
              <strong>OBS Server:</strong> <code className="bg-green-500/20 px-1 rounded">{obsServerUrl}</code>
            </p>
            <p className="text-muted-foreground">
              <strong>Stream Key:</strong> The key you copied above
            </p>
            <p className="text-xs text-green-400 mt-2">
              When you click "Start Streaming" in OBS, it creates: {fullRtmpUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
