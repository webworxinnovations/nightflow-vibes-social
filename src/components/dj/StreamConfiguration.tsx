
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, AlertTriangle, Key } from "lucide-react";
import { toast } from "sonner";

interface StreamConfigurationProps {
  debugInfo: {
    streamUrl: string;
    streamKey: string;
    rtmpUrl: string;
    status: string;
  } | null;
  hasMixedContentIssue: boolean;
  onGenerateNewKey: () => Promise<void>;
  onClearAndRegenerate: () => Promise<void>;
}

export const StreamConfiguration = ({ 
  debugInfo, 
  hasMixedContentIssue, 
  onGenerateNewKey, 
  onClearAndRegenerate 
}: StreamConfigurationProps) => {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  if (!debugInfo) {
    return (
      <div className="text-center py-6">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <p className="text-amber-400 font-medium">No stream configuration found</p>
          </div>
          <p className="text-amber-400 text-sm">
            Generate a stream key to connect OBS to your DigitalOcean droplet server.
          </p>
        </div>
        <Button onClick={onClearAndRegenerate} className="bg-blue-600 hover:bg-blue-700">
          <Key className="mr-2 h-4 w-4" />
          Generate Fresh Stream Key for Droplet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <p className="text-green-400 font-medium">
            ✅ Stream configuration ready for DigitalOcean droplet (IP: 67.205.179.77)
          </p>
        </div>
      </div>

      {/* OBS Server URL */}
      <div className="space-y-2">
        <Label className="text-blue-400">OBS Server URL (for DigitalOcean Droplet)</Label>
        <div className="flex gap-2">
          <Input
            value={debugInfo.rtmpUrl}
            readOnly
            className="font-mono text-sm bg-blue-500/10 border-blue-500/20"
          />
          <Button
            onClick={() => copyToClipboard(debugInfo.rtmpUrl, 'Server URL')}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stream Key */}
      <div className="space-y-2">
        <Label className="text-green-400">Stream Key</Label>
        <div className="flex gap-2">
          <Input
            value={debugInfo.streamKey}
            readOnly
            type="password"
            className="font-mono text-sm bg-green-500/10 border-green-500/20"
          />
          <Button
            onClick={() => copyToClipboard(debugInfo.streamKey, 'Stream key')}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Droplet Connection Info */}
      <div className="text-xs text-muted-foreground bg-slate-800/50 p-3 rounded">
        <p className="font-medium text-blue-400 mb-2">DigitalOcean Droplet Configuration:</p>
        <p>🌊 Droplet IP: 67.205.179.77</p>
        <p>📡 RTMP Port: 1935 (for OBS connection)</p>
        <p>🎥 HLS Port: 3001 (for web playback)</p>
        <p>🔗 HLS URL: {debugInfo.streamUrl}</p>
        <p>📊 Status: {debugInfo.status}</p>
        {hasMixedContentIssue && (
          <p className="text-red-400 mt-2">🔒 Mixed content issue detected!</p>
        )}
        <p className="text-red-400 mt-2">⚠️ Firewall ports need to be opened!</p>
      </div>
    </div>
  );
};
