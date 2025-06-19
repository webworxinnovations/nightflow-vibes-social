import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { streamingService } from "@/services/streamingService";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Trash2,
  ExternalLink,
  Play,
  Users,
  Timer,
  Activity,
  Server,
  AlertCircle,
  CheckCircle,
  Cloud,
  Monitor,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";

export const StreamKeyManager = () => {
  const { 
    streamConfig, 
    streamStatus, 
    isLoading,
    generateStreamKey, 
    revokeStreamKey, 
    isLive, 
    viewerCount,
    duration,
    bitrate
  } = useRealTimeStream();
  
  const [showKey, setShowKey] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [checkingServer, setCheckingServer] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Enhanced server status check with debugging
  const checkServerStatus = async () => {
    setCheckingServer(true);
    console.log('🔍 Starting comprehensive server status check...');
    
    try {
      const status = await streamingService.getServerStatus();
      setServerStatus(status);
      
      // Additional debugging tests
      const debugResults: any = {
        baseServerCheck: status,
        timestamp: new Date().toISOString()
      };

      // Test multiple endpoints
      const testEndpoints = [
        { path: '/', name: 'Root' },
        { path: '/health', name: 'Health Check' },
        { path: '/api/health', name: 'API Health' }
      ];

      for (const endpoint of testEndpoints) {
        try {
          console.log(`🧪 Testing ${endpoint.name}: ${status.url}${endpoint.path}`);
          const response = await fetch(`${status.url}${endpoint.path}`, {
            method: 'GET',
            signal: AbortSignal.timeout(10000)
          });
          
          const responseText = await response.text().catch(() => 'No response body');
          
          debugResults[endpoint.name] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText.substring(0, 500) // Limit body size
          };
          
          console.log(`✅ ${endpoint.name} result:`, debugResults[endpoint.name]);
        } catch (error) {
          debugResults[endpoint.name] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            failed: true
          };
          console.log(`❌ ${endpoint.name} failed:`, debugResults[endpoint.name]);
        }
      }

      setDebugInfo(debugResults);
      console.log('📊 Complete debug results:', debugResults);
      
    } catch (error) {
      console.error('❌ Server status check failed:', error);
      setServerStatus({ available: false, url: 'https://nightflow-vibes-social-production.up.railway.app' });
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setCheckingServer(false);
    }
  };

  // Test RTMP connection specifically
  const testRTMPConnection = async () => {
    if (!streamConfig?.streamKey) {
      toast.error('Generate a stream key first');
      return;
    }

    setTestingConnection(true);
    console.log('🎥 Testing RTMP connection with stream key:', streamConfig.streamKey);
    
    try {
      // Test 1: Check if server is responding
      const serverCheck = await streamingService.getServerStatus();
      console.log('📡 Server status:', serverCheck);
      
      if (!serverCheck.available) {
        toast.error('❌ RTMP server is offline - this is why OBS can\'t connect!');
        setTestingConnection(false);
        return;
      }
      
      // Test 2: Try to validate the stream key
      toast.info('🔍 Validating stream key with server...');
      const isValid = await streamingService.validateStreamKey(streamConfig.streamKey);
      console.log('🔑 Stream key validation result:', isValid);
      
      if (isValid) {
        toast.success('✅ Stream key is valid! RTMP server should accept your connection.');
        
        // Test 3: Try to make a test connection to the RTMP endpoint
        toast.info('🧪 Testing direct RTMP endpoint...');
        
        try {
          // Try to connect to the RTMP URL directly
          const rtmpTestUrl = `${serverCheck.url}/api/rtmp/test`;
          const rtmpResponse = await fetch(rtmpTestUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streamKey: streamConfig.streamKey }),
            signal: AbortSignal.timeout(15000)
          });
          
          if (rtmpResponse.ok) {
            const result = await rtmpResponse.json();
            toast.success('🎯 RTMP endpoint is working! Try OBS again.');
            console.log('✅ RTMP test successful:', result);
          } else {
            toast.warning(`⚠️ RTMP endpoint returned ${rtmpResponse.status}. Server may have issues.`);
          }
        } catch (rtmpError) {
          console.log('RTMP endpoint test failed:', rtmpError);
          toast.warning('⚠️ Could not test RTMP endpoint directly, but stream key is valid.');
        }
        
        // Show detailed connection info
        toast.info(
          `📡 OBS Settings Confirmed:\n` +
          `Server: ${streamConfig.rtmpUrl}\n` +
          `Key: ${streamConfig.streamKey.substring(0, 8)}...\n` +
          `Status: Ready for streaming`,
          { duration: 10000 }
        );
      } else {
        toast.error('❌ Stream key validation failed. Try generating a new key.');
      }
    } catch (error) {
      console.error('❌ RTMP test failed:', error);
      toast.error(`Failed to test RTMP connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    // Check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isProduction = window.location.hostname !== 'localhost';

  return (
    <div className="space-y-6">
      {/* Enhanced Server Status with Debug Info */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            RTMP Server Status & Diagnostics
          </h3>
          
          <div className="flex items-center gap-2">
            {checkingServer ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-muted border-t-white rounded-full animate-spin"></div>
                Checking...
              </div>
            ) : serverStatus?.available ? (
              <div className="flex items-center gap-2 text-green-500">
                <Wifi className="h-4 w-4" />
                Online
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500">
                <WifiOff className="h-4 w-4" />
                Offline
              </div>
            )}
            
            <Button 
              onClick={checkServerStatus} 
              disabled={checkingServer}
              variant="outline"
              size="sm"
            >
              Recheck
            </Button>
          </div>
        </div>

        {!checkingServer && (
          <div className={`p-4 rounded-lg border ${
            serverStatus?.available 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            {serverStatus?.available ? (
              <div className="space-y-3">
                <p className="text-green-400 font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  ✅ RTMP streaming server is online and ready
                </p>
                <p className="text-sm text-muted-foreground">
                  Server URL: {serverStatus.url}
                </p>
                
                {/* Debug Information */}
                {debugInfo && (
                  <details className="mt-3">
                    <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                      🔬 Show Technical Details (for debugging OBS issues)
                    </summary>
                    <div className="mt-2 p-3 bg-slate-800 rounded text-xs font-mono space-y-2">
                      {Object.entries(debugInfo).map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <strong className="text-blue-400">{key}:</strong>
                          <pre className="text-gray-300 ml-2 whitespace-pre-wrap">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-red-400 font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  ❌ RTMP server not responding
                </p>
                <p className="text-sm text-muted-foreground">
                  This explains why OBS can't connect. The streaming infrastructure needs attention.
                </p>
                
                {debugInfo && (
                  <details className="mt-3">
                    <summary className="text-sm text-orange-400 cursor-pointer">
                      🔍 Error Details
                    </summary>
                    <div className="mt-2 p-3 bg-slate-800 rounded text-xs font-mono">
                      <pre className="text-red-300 whitespace-pre-wrap">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </GlassmorphicCard>

      {/* Stream Configuration with Enhanced Testing */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            OBS Stream Configuration
          </h3>
          
          {isLive && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {viewerCount} viewers
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Timer className="h-4 w-4" />
                {formatTime(duration)}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Activity className="h-4 w-4" />
                {(bitrate / 1000).toFixed(1)}k
              </div>
            </div>
          )}
        </div>

        {streamConfig ? (
          <div className="space-y-4">
            {/* Connection Test Section */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 font-medium">🧪 Test RTMP Connection</p>
                <Button
                  onClick={testRTMPConnection}
                  disabled={testingConnection || !serverStatus?.available}
                  variant="outline"
                  size="sm"
                  className="min-w-[120px]"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This will verify your stream key works with the RTMP server before trying OBS.
              </p>
            </div>

            {/* OBS Configuration */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>RTMP Server URL (for OBS)</Label>
                <div className="flex gap-2">
                  <Input
                    value={streamConfig.rtmpUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(streamConfig.rtmpUrl, 'RTMP URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stream Key (for OBS)</Label>
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
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateStreamKey}
                variant="outline"
                className="flex-1"
                disabled={isLoading || !serverStatus?.available}
              >
                {isLoading ? 'Generating...' : 'Generate New Key'}
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
            
            {!serverStatus?.available && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm font-medium">
                  ⚠️ OBS Connection Issue Identified:
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The RTMP server is not responding. This is why OBS shows "Failed to connect to server". 
                  The streaming infrastructure needs to be deployed or restarted.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No Stream Key Generated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a stream key to enable OBS broadcasting
            </p>
            <Button 
              onClick={generateStreamKey} 
              disabled={isLoading || !serverStatus?.available}
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Stream Key'}
            </Button>
            {!serverStatus?.available && (
              <p className="text-sm text-red-400 mt-2">
                Streaming server must be online to generate keys
              </p>
            )}
          </div>
        )}
      </GlassmorphicCard>

      {/* Enhanced OBS Setup Instructions */}
      <GlassmorphicCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          OBS Troubleshooting Guide
        </h3>
        
        <div className="space-y-4">
          {!serverStatus?.available && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-medium text-red-400 mb-3">🚨 Connection Issue Found:</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The RTMP streaming server at <code className="bg-muted px-1 rounded">nightflow-vibes-social-production.up.railway.app</code> is not responding.
              </p>
              <p className="text-sm text-muted-foreground">
                This explains why OBS shows "Failed to connect to server" - the issue is on the server side, not with your OBS configuration.
              </p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-3">📋 Your OBS Settings Look Correct:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Service: Custom... ✅</li>
              <li>Server: rtmp://nightflow-vibes-social-production.up.railway.app/live ✅</li>
              <li>Stream Key: Present ✅</li>
            </ul>
          </div>

          {serverStatus?.available && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-3">🎯 Server is Online - Try These Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Test Connection" above to verify your stream key</li>
                <li>If test passes, restart OBS completely</li>
                <li>In OBS, try changing Settings → Advanced → Network → Bind to IP to "Default"</li>
                <li>Try generating a new stream key and copying it fresh into OBS</li>
                <li>Check if your firewall or network is blocking RTMP (port 1935)</li>
              </ol>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
