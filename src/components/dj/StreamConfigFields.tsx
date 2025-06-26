
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { StreamingConfig } from "@/services/streaming/config";

interface StreamConfigFieldsProps {
  streamKey: string;
}

export const StreamConfigFields = ({ streamKey }: StreamConfigFieldsProps) => {
  const [showKey, setShowKey] = useState(false);

  // Get the correct URLs from StreamingConfig
  const obsServerUrl = StreamingConfig.getOBSServerUrl();
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
      {/* Clear Success Message */}
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <p className="text-sm text-green-400 font-medium">
            ✅ Your OBS streaming configuration is ready! Copy the values below.
          </p>
        </div>
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
            onClick={() => copyToClipboard(obsServerUrl, 'OBS Server URL')}
            variant="outline"
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-blue-400">
          ✅ Copy this into OBS Settings → Stream → Server field
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
        <p className="text-xs text-green-400">
          ✅ Paste this into OBS Settings → Stream → Stream Key field
        </p>
      </div>

      {/* Quick Setup Steps */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-400 mb-2">📋 Quick OBS Setup:</h4>
        <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
          <li>Open OBS → Settings → Stream</li>
          <li>Service: Select "Custom..."</li>
          <li>Server: Paste the server URL above</li>
          <li>Stream Key: Paste your stream key</li>
          <li>Click "Apply" → "OK" → "Start Streaming"</li>
        </ol>
      </div>

      {/* Troubleshooting (Simplified) */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-400 mb-1">If OBS can't connect:</p>
            <ul className="text-amber-300 space-y-1 text-xs">
              <li>• Make sure you're using the RTMP URL (not HTTP/HTTPS)</li>
              <li>• Check your firewall allows port 1935</li>
              <li>• Try from a different network (mobile hotspot)</li>
              <li>• Restart OBS completely</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
