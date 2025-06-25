
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
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
          <span className="text-xs text-green-400 ml-2">(✅ Correct format for OBS)</span>
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
          ✅ This is the correct URL for OBS Settings → Stream → Server field (OBS will add /live automatically)
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

      {/* Updated explanation */}
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-green-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-400 mb-1">✅ Correct OBS Setup:</p>
            <p className="text-muted-foreground">
              <strong>Server:</strong> <code className="bg-green-500/20 px-1 rounded">{obsServerUrl}</code>
            </p>
            <p className="text-muted-foreground">
              <strong>Stream Key:</strong> Copy your stream key from above
            </p>
            <p className="text-xs text-green-400 mt-2">
              OBS will automatically append "/live" to create the full URL: {fullRtmpUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
