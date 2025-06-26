
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Play, Trash2, AlertTriangle, CheckCircle, Wifi, Globe, Settings, TestTube } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { StreamingConfig } from "@/services/streaming/config";

export const SimpleStreamSetup = () => {
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [rtmpTestResult, setRtmpTestResult] = useState<any>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const { streamConfig, isLoading, generateStreamKey, revokeStreamKey, isLive, viewerCount } = useRealTimeStream();

  // Automatically test RTMP server when component loads
  useEffect(() => {
    const testRTMPOnLoad = async () => {
      console.log('🔍 Starting automatic RTMP server test...');
      
      try {
        // Test RTMP server connection
        const rtmpResult = await StreamingConfig.testRTMPServerConnection();
        console.log('🔍 RTMP test result:', rtmpResult);
        setRtmpTestResult(rtmpResult);
        
        // Verify RTMP server status
        const serverCheck = await StreamingConfig.verifyRTMPServerStatus();
        console.log('🏥 Server status:', serverCheck);
        setServerStatus(serverCheck);
        
        if (!rtmpResult.success) {
          toast.error('RTMP server connection issues detected!', { duration: 7000 });
        } else if (!rtmpResult.domainWorking) {
          toast.warning('DNS issue detected - use IP address in OBS!', { duration: 5000 });
        } else {
          toast.success('RTMP server ready for OBS!');
        }
      } catch (error) {
        console.error('❌ RTMP test failed:', error);
        toast.error('Failed to test RTMP server');
      }
    };

    testRTMPOnLoad();
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

  const runRTMPDiagnostics = async () => {
    setTestingConnection(true);
    try {
      console.log('🔍 Running comprehensive RTMP diagnostics...');
      
      const rtmpResult = await StreamingConfig.testRTMPServerConnection();
      setRtmpTestResult(rtmpResult);
      
      const serverCheck = await StreamingConfig.verifyRTMPServerStatus();
      setServerStatus(serverCheck);
      
      if (rtmpResult.success) {
        toast.success('RTMP diagnostics completed - see results below');
      } else {
        toast.error('RTMP issues found - check diagnostics below');
      }
    } catch (error) {
      console.error('❌ RTMP diagnostics failed:', error);
      toast.error('Diagnostics failed - server may be offline');
    } finally {
      setTestingConnection(false);
    }
  };

  // Get the correct server URLs
  const obsServerUrl = StreamingConfig.getOBSServerUrl();
  const obsServerUrlIP = StreamingConfig.getOBSServerUrlIP();

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">OBS Professional Setup</h3>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">LIVE • {viewerCount} viewers</span>
            </div>
          )}
        </div>

        {/* RTMP Server Status */}
        {(rtmpTestResult || serverStatus) && (
          <div className="space-y-4">
            {/* Server Connection Status */}
            <div className={`p-4 border rounded-lg ${
              rtmpTestResult?.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {rtmpTestResult?.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium mb-2 ${
                    rtmpTestResult?.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {rtmpTestResult?.success ? '✅ RTMP Server Ready' : '❌ RTMP Server Issues'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rtmpTestResult?.message}
                  </p>
                  
                  {rtmpTestResult?.recommendations?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Recommendations:</p>
                      <ul className="text-xs space-y-1">
                        {rtmpTestResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-muted-foreground">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Server Status Details */}
            {serverStatus && (
              <div className={`p-3 border rounded-lg ${
                serverStatus.running 
                  ? 'bg-blue-500/10 border-blue-500/20' 
                  : 'bg-orange-500/10 border-orange-500/20'
              }`}>
                <p className={`font-medium text-sm ${
                  serverStatus.running ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  🖥️ Server Status: {serverStatus.running ? 'Online' : 'Issues Detected'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{serverStatus.message}</p>
              </div>
            )}
          </div>
        )}

        {streamConfig ? (
          <div className="space-y-4">
            {/* OBS Server URL - Domain */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-blue-400">
                📹 OBS Server URL (Primary)
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
                {rtmpTestResult?.domainWorking ? '✅ Domain working - use this first' : '⚠️ Domain issues detected'}
              </p>
            </div>

            {/* OBS Server URL - IP Address */}
            <div className="space-y-2">
              <Label className={`text-base font-semibold ${
                rtmpTestResult?.domainWorking ? 'text-slate-400' : 'text-amber-400'
              }`}>
                🔄 OBS Server URL (IP Backup)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={obsServerUrlIP}
                  readOnly
                  className={`font-mono text-sm ${
                    rtmpTestResult?.domainWorking 
                      ? 'bg-slate-500/10 border-slate-500/20 text-slate-300' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  }`}
                />
                <Button
                  onClick={() => copyToClipboard(obsServerUrlIP, 'IP Server URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className={`text-xs ${
                rtmpTestResult?.domainWorking ? 'text-slate-400' : 'text-amber-400'
              }`}>
                {rtmpTestResult?.domainWorking 
                  ? '💡 Backup option if primary fails' 
                  : '⚠️ Use this IP address instead of domain'
                }
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

            {/* RTMP Diagnostics */}
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-400 font-medium">🔬 RTMP Server Diagnostics</p>
                <Button
                  onClick={runRTMPDiagnostics}
                  disabled={testingConnection}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingConnection ? 'Testing...' : 'Run Diagnostics'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Tests RTMP server connectivity and provides specific OBS troubleshooting
              </p>
            </div>

            {/* Detailed OBS Instructions */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-medium text-green-400 mb-3">📋 Exact OBS Setup Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-green-300">
                <li><strong>Open OBS Studio</strong></li>
                <li><strong>Go to Settings → Stream</strong></li>
                <li><strong>Service:</strong> Select "Custom..."</li>
                <li><strong>Server:</strong> Copy the {!rtmpTestResult?.domainWorking ? 'IP backup' : 'primary'} URL above</li>
                <li><strong>Stream Key:</strong> Copy your stream key above</li>
                <li><strong>Click "Apply" → "OK"</strong></li>
                <li><strong>Click "Start Streaming" in main OBS window</strong></li>
              </ol>
              
              {rtmpTestResult && !rtmpTestResult.success && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm">
                  <p className="text-red-400 font-medium mb-1">⚠️ Critical Issue:</p>
                  <p className="text-red-300">
                    RTMP server test failed. This means OBS cannot connect. Check server status or contact support.
                  </p>
                </div>
              )}
              
              {rtmpTestResult && !rtmpTestResult.domainWorking && rtmpTestResult.ipWorking && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-sm">
                  <p className="text-amber-400 font-medium mb-1">💡 DNS Issue Fix:</p>
                  <p className="text-amber-300">
                    Your network cannot resolve the domain. Use the <strong>IP Backup URL</strong> above in OBS.
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
              <Settings className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="font-medium mb-2">Ready for Professional Streaming</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your stream key and get detailed RTMP diagnostics
            </p>
            <Button 
              onClick={generateStreamKey} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Setting up...' : 'Generate Stream Key & Test RTMP'}
            </Button>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
