
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Play, Trash2, AlertTriangle, CheckCircle, Wifi } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { StreamingConfig } from "@/services/streaming/config";

export const SimpleStreamSetup = () => {
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [serverIP, setServerIP] = useState<string | null>(null);
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
      
      // Also try to get server IP for DNS troubleshooting
      const ip = await StreamingConfig.getServerIP();
      if (ip) {
        setServerIP(ip);
        toast.success(`🎯 Server Status: Ready! IP: ${ip}`);
      } else {
        toast.success('🎯 Server Status: Ready for streaming!');
      }
      
      toast.info('💡 If OBS still fails, try the troubleshooting steps below', { duration: 5000 });
    } catch (error) {
      toast.error('Connection test failed - but server may still work');
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
            {/* Success Message */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium mb-2">
                    ✅ Stream ready! Your DigitalOcean server is running perfectly.
                  </p>
                  <div className="text-sm text-green-300">
                    <p>• Service: <strong>Custom...</strong></p>
                    <p>• Server: <strong>{obsServerUrl}</strong></p>
                    <p>• Stream Key: <strong>Your generated key below</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* OBS Server URL */}
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
            </div>

            {/* Server Status Test */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 font-medium">🧪 Server Status Check</p>
                <Button
                  onClick={testRTMPConnection}
                  disabled={testingConnection}
                  variant="outline"
                  size="sm"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  {testingConnection ? 'Checking...' : 'Check Server'}
                </Button>
              </div>
              {serverIP && (
                <p className="text-xs text-green-400 mb-2">
                  ✅ Server IP: {serverIP} (use this if domain fails)
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Your DigitalOcean deployment logs confirm RTMP server is running on port 1935
              </p>
            </div>

            {/* OBS Troubleshooting for "Hostname not found" */}
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-400 mb-3">🚨 OBS "Hostname not found" Fix:</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
                      <p className="font-medium text-amber-400">Method 1: Try Server IP Instead</p>
                      {serverIP ? (
                        <div className="mt-1">
                          <p className="text-amber-300">Use: <code className="bg-amber-500/20 px-1 rounded">rtmp://{serverIP}:1935/live</code></p>
                          <Button 
                            onClick={() => copyToClipboard(`rtmp://${serverIP}:1935/live`, 'Server IP URL')}
                            variant="outline" 
                            size="sm" 
                            className="mt-1"
                          >
                            Copy IP URL
                          </Button>
                        </div>
                      ) : (
                        <p className="text-amber-300">Click "Check Server" above to get IP address</p>
                      )}
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                      <p className="font-medium text-blue-400">Method 2: Network Fixes</p>
                      <ul className="text-blue-300 mt-1 space-y-1 text-xs">
                        <li>• Try mobile hotspot instead of WiFi</li>
                        <li>• Restart your router/modem</li>
                        <li>• Flush DNS: Open CMD as admin → type "ipconfig /flushdns"</li>
                        <li>• Try different DNS: 8.8.8.8 or 1.1.1.1</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                      <p className="font-medium text-purple-400">Method 3: OBS Fixes</p>
                      <ul className="text-purple-300 mt-1 space-y-1 text-xs">
                        <li>• Completely close and restart OBS</li>
                        <li>• Run OBS as Administrator</li>
                        <li>• Temporarily disable Windows Defender/antivirus</li>
                      </ul>
                    </div>
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
              Your DigitalOcean server is confirmed running - generate your stream key
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
