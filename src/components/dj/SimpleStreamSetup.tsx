
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Play, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { StreamingConfig } from "@/services/streaming/config";

export const SimpleStreamSetup = () => {
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { streamConfig, isLoading, generateStreamKey, revokeStreamKey, isLive, viewerCount } = useRealTimeStream();

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

  const testRTMPConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await StreamingConfig.testRTMPConnection();
      if (result.success) {
        toast.success('🎯 RTMP server is reachable! Try OBS connection now.');
      } else {
        toast.error(`❌ Connection issue: ${result.message}`);
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  // Get the exact OBS server URL
  const obsServerUrl = StreamingConfig.getOBSServerUrl();

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">OBS Stream Setup</h3>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">LIVE • {viewerCount} viewers</span>
            </div>
          )}
        </div>

        {streamConfig ? (
          <div className="space-y-4">
            {/* Critical Success Message */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium mb-2">
                    ✅ Stream configuration ready! Use these EXACT values in OBS:
                  </p>
                  <div className="text-sm text-green-300">
                    <p>• Service: <strong>Custom...</strong></p>
                    <p>• Server: <strong>{obsServerUrl}</strong></p>
                    <p>• Stream Key: <strong>Your generated key below</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* OBS Server URL - EXACT FORMAT */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-blue-400">
                📹 OBS Server URL (Copy Exactly)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={obsServerUrl}
                  readOnly
                  className="font-mono text-sm bg-blue-500/10 border-blue-500/20 text-blue-300"
                />
                <Button
                  onClick={() => copyToClipboard(obsServerUrl, 'Server URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-400">
                ⚠️ Copy this EXACT URL into OBS Settings → Stream → Server
              </p>
            </div>

            {/* Stream Key */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">🔑 Stream Key</Label>
              <div className="flex gap-2">
                <Input
                  value={formatStreamKey(streamConfig.streamKey)}
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
                  onClick={() => copyToClipboard(streamConfig.streamKey, 'Stream key')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-green-400">
                ✅ Paste this in OBS Settings → Stream → Stream Key
              </p>
            </div>

            {/* Connection Test */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 font-medium">🧪 Test RTMP Connection</p>
                <Button
                  onClick={testRTMPConnection}
                  disabled={testingConnection}
                  variant="outline"
                  size="sm"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Verify server connectivity before trying OBS
              </p>
            </div>

            {/* Exact OBS Steps */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-400 mb-3">🎯 EXACT OBS Setup Steps:</h4>
                  <ol className="text-sm text-amber-300 space-y-1 list-decimal list-inside">
                    <li>Open OBS Studio → Settings → Stream</li>
                    <li>Service: Select <strong>"Custom..."</strong></li>
                    <li>Server: Paste <strong>{obsServerUrl}</strong></li>
                    <li>Stream Key: Paste your stream key from above</li>
                    <li>Click "Apply" → "OK"</li>
                    <li>Click "Start Streaming"</li>
                  </ol>
                  
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                    <p className="text-red-400 font-medium">If still failing:</p>
                    <ul className="text-red-300 mt-1 space-y-1">
                      <li>• Restart OBS completely</li>
                      <li>• Try mobile hotspot instead of WiFi</li>
                      <li>• Run OBS as administrator</li>
                      <li>• Temporarily disable firewall</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={generateStreamKey}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Generate New Key
              </Button>
              <Button
                onClick={revokeStreamKey}
                variant="destructive"
                size="sm"
                disabled={isLive}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="font-medium mb-2">Ready to Stream</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your stream configuration to get started with OBS
            </p>
            <Button 
              onClick={generateStreamKey} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Setting up...' : 'Generate Stream Key'}
            </Button>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
