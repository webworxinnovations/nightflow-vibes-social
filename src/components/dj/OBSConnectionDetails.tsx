
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface OBSConnectionDetailsProps {
  streamKey: string;
  rtmpUrl: string;
}

export const OBSConnectionDetails = ({ streamKey, rtmpUrl }: OBSConnectionDetailsProps) => {
  const [showKey, setShowKey] = useState(false);

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
    </>
  );
};
