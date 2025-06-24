
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface StreamConfigFieldsProps {
  obsServerUrl: string;
  fullRtmpUrl: string;
  streamKey: string;
}

export const StreamConfigFields = ({ 
  obsServerUrl, 
  fullRtmpUrl, 
  streamKey 
}: StreamConfigFieldsProps) => {
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
    <div className="space-y-4">
      {/* OBS Server URL - Clear and separate */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          OBS Server URL 
          <span className="text-xs text-orange-400 ml-2">(⚠️ Do NOT include /live)</span>
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
        <p className="text-xs text-muted-foreground">
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

      {/* Common Mistake Warning */}
      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-400 mb-1">Common OBS Mistake:</p>
            <p className="text-muted-foreground">
              ❌ Don't use: <code className="bg-red-500/20 px-1 rounded">{fullRtmpUrl}</code>
            </p>
            <p className="text-muted-foreground">
              ✅ Use this instead: <code className="bg-green-500/20 px-1 rounded">{obsServerUrl}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
