
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Play, Trash2, AlertTriangle, CheckCircle, Wifi, Globe } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { StreamingConfig } from "@/services/streaming/config";

export const SimpleStreamSetup = () => {
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [dnsTestResult, setDnsTestResult] = useState<any>(null);
  const { streamConfig, isLoading, generateStreamKey, revokeStreamKey, isLive, viewerCount } = useRealTimeStream();

  // Automatically test DNS when component loads
  useEffect(() => {
    const testDNSOnLoad = async () => {
      const result = await StreamingConfig.testDNSAndConnectivity();
      setDnsTestResult(result);
      
      if (!result.dnsWorking && result.serverIP) {
        toast.warning('DNS issue detected - IP address backup ready!', { duration: 5000 });
      }
    };

    testDNSOnLoad();
  }, []);

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

  const testDNSConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await StreamingConfig.testDNSAndConnectivity();
      setDnsTestResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.warning(result.message, { duration: 7000 });
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  // Get the server URLs (both domain and IP if available)
  const obsServerUrl = StreamingConfig.getOBSServerUrl();
  const ipServerUrl = dnsTestResult?.serverIP ? `rtmp://${dnsTestResult.serverIP}:1935/live` : null;

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
            {/* DNS Status Display */}
            {dnsTestResult && (
              <div className={`p-4 border rounded-lg ${
                dnsTestResult.success 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                <div className="flex items-start gap-3">
                  {dnsTestResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  ) : (
                    <Globe className="h-5 w-5 text-amber-400 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium mb-2 ${
                      dnsTestResult.success ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {dnsTestResult.success ? '✅ Perfect Connection' : '⚠️ DNS Issue Detected'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dnsTestResult.message}
                    </p>
                    {dnsTestResult.serverIP && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Server IP: {dnsTestResult.serverIP}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Primary Server URL */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-blue-400">
                📹 Primary OBS Server URL
              </Label>
              <div className="flex gap-2">
                <Input
                  value={obsServerUrl}
                  readOnly
                  className="font-mono text-sm bg-blue-500/10 border-blue-500/20 text-blue-300"
                />
                <Button
                  onClick={() => copyToClipboard(obsServerUrl, 'Primary Server URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-400">
                ✅ Use this URL first - works for most users
              </p>
            </div>

            {/* Backup IP Server URL (if DNS issue detected) */}
            {ipServerUrl && !dnsTestResult?.dnsWorking && (
              <div className="space-y-2">
                <Label className="text-base font-semibold text-amber-400">
                  🔄 Backup Server URL (DNS Fix)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={ipServerUrl}
                    readOnly
                    className="font-mono text-sm bg-amber-500/10 border-amber-500/20 text-amber-300"
                  />
                  <Button
                    onClick={() => copyToClipboard(ipServerUrl, 'Backup IP Server URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-amber-400">
                  ⚠️ If primary URL fails in OBS, use this IP address instead
                </p>
              </div>
            )}

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

            {/* Connection Test */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 font-medium">🧪 Test Connection</p>
                <Button
                  onClick={testDNSConnection}
                  disabled={testingConnection}
                  variant="outline"
                  size="sm"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  {testingConnection ? 'Testing...' : 'Test DNS'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically detects DNS issues and provides backup solutions
              </p>
            </div>

            {/* User-Friendly Instructions */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-medium text-green-400 mb-3">📋 Easy OBS Setup:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-300">
                <li>Open OBS → Settings → Stream</li>
                <li>Service: Select "Custom..."</li>
                <li>Server: Copy the {dnsTestResult?.dnsWorking === false ? 'backup' : 'primary'} URL above</li>
                <li>Stream Key: Copy your stream key above</li>
                <li>Click Apply → OK → Start Streaming</li>
              </ol>
              
              {!dnsTestResult?.dnsWorking && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs">
                  <p className="text-amber-400 font-medium">💡 Pro Tip:</p>
                  <p className="text-amber-300">
                    Your network has a DNS issue. Use the backup IP URL above - it will work perfectly!
                  </p>
                </div>
              )}
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
              Generate your stream key and we'll automatically check for DNS issues
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
