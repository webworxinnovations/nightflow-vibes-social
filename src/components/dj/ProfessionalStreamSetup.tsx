
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, CheckCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { StreamingConfig } from "@/services/streaming/config";

interface ProfessionalStreamSetupProps {
  streamKey: string;
}

export const ProfessionalStreamSetup = ({ streamKey }: ProfessionalStreamSetupProps) => {
  const [showKey, setShowKey] = useState(false);
  
  // Get the correct RTMP URL for OBS
  const obsServerUrl = StreamingConfig.getOBSServerUrl();

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
      {/* Clear OBS Setup Instructions */}
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-400 mb-2">✅ Perfect! Your Professional Stream Setup is Ready</h4>
            <p className="text-sm text-green-300 mb-3">
              Copy these exact values into OBS Studio for guaranteed compatibility:
            </p>
          </div>
        </div>
      </div>

      {/* OBS Server URL - Primary */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-blue-400">
          📹 OBS Server URL (Copy this exactly)
        </Label>
        <div className="flex gap-2">
          <Input
            value={obsServerUrl}
            readOnly
            className="font-mono text-sm bg-blue-500/10 border-blue-500/30 text-blue-300"
          />
          <Button
            onClick={() => copyToClipboard(obsServerUrl, 'OBS Server URL')}
            variant="outline"
            size="sm"
            className="bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-blue-400">
          ✅ This goes in OBS Settings → Stream → Server field
        </p>
      </div>

      {/* Stream Key */}
      <div className="space-y-2">
        <Label className="text-lg font-bold text-green-400">
          🔑 Stream Key (Keep private)
        </Label>
        <div className="flex gap-2">
          <Input
            value={formatStreamKey(streamKey)}
            readOnly
            type={showKey ? "text" : "password"}
            className="font-mono text-sm bg-green-500/10 border-green-500/30"
          />
          <Button
            onClick={() => setShowKey(!showKey)}
            variant="outline"
            size="sm"
            className="bg-green-500/20 border-green-500/30"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => copyToClipboard(streamKey, 'Stream key')}
            variant="outline"
            size="sm"
            className="bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-green-400">
          ✅ This goes in OBS Settings → Stream → Stream Key field
        </p>
      </div>

      {/* Step-by-Step OBS Setup */}
      <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-slate-300 mb-3">📋 OBS Studio Setup (Follow exactly):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
              <li>Open OBS Studio</li>
              <li>Click <strong>Settings</strong> → <strong>Stream</strong></li>
              <li>Service: Select <strong>"Custom..."</strong></li>
              <li>Server: Paste → <code className="bg-blue-500/20 px-1 rounded text-blue-300">{obsServerUrl}</code></li>
              <li>Stream Key: Paste your stream key from above</li>
              <li>Click <strong>"Apply"</strong> → <strong>"OK"</strong></li>
              <li>Click <strong>"Start Streaming"</strong> in main OBS window</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Success Confirmation */}
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="text-sm text-green-400 font-medium">
          🎉 <strong>Ready to Go Live!</strong> Once you paste these values into OBS and click "Start Streaming", 
          your stream will be live on Night Flow!
        </p>
      </div>
    </div>
  );
};
