
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { StreamingConfig } from "@/services/streaming/config";

interface OBSConnectionManagerProps {
  streamKey: string;
  onTestConnection?: () => void;
}

export const OBSConnectionManager = ({ streamKey, onTestConnection }: OBSConnectionManagerProps) => {
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionTest, setConnectionTest] = useState<any>(null);

  const obsSetup = StreamingConfig.getOBSSetupInstructions();

  useEffect(() => {
    // Auto-test connection when component loads
    handleTestConnection();
  }, []);

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

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await StreamingConfig.testRTMPConnection();
      setConnectionTest(result);
      
      if (result.primary.success) {
        toast.success('✅ Primary RTMP server ready for OBS!');
      } else if (result.backup.success) {
        toast.warning('⚠️ Use backup server - primary unavailable');
      } else {
        toast.error('❌ Both RTMP servers unavailable');
      }
      
      onTestConnection?.();
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">OBS Studio Configuration</h3>
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {/* Connection Status */}
        {connectionTest && (
          <div className="space-y-3">
            <div className={`p-4 border rounded-lg ${
              connectionTest.primary.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {connectionTest.primary.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    connectionTest.primary.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Primary RTMP Server: {connectionTest.primary.success ? 'Ready' : 'Unavailable'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {connectionTest.primary.url}
                  </p>
                  {connectionTest.primary.error && (
                    <p className="text-sm text-red-400 mt-1">
                      Error: {connectionTest.primary.error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!connectionTest.primary.success && (
              <div className={`p-4 border rounded-lg ${
                connectionTest.backup.success 
                  ? 'bg-amber-500/10 border-amber-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-start gap-3">
                  {connectionTest.backup.success ? (
                    <CheckCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      connectionTest.backup.success ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      Backup RTMP Server: {connectionTest.backup.success ? 'Ready' : 'Unavailable'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {connectionTest.backup.url}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {connectionTest.recommendations.length > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 font-medium mb-2">Recommendations:</p>
                <ul className="text-sm text-blue-300 space-y-1">
                  {connectionTest.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* OBS Server URL */}
        <div className="space-y-2">
          <Label className="text-lg font-bold text-blue-400">
            📹 OBS Server URL
          </Label>
          <div className="flex gap-2">
            <Input
              value={connectionTest?.primary.success ? obsSetup.server : obsSetup.backup_server}
              readOnly
              className="font-mono text-sm bg-blue-500/10 border-blue-500/20 text-blue-300"
            />
            <Button
              onClick={() => copyToClipboard(
                connectionTest?.primary.success ? obsSetup.server : obsSetup.backup_server, 
                'OBS Server URL'
              )}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-blue-400">
            ✅ Copy this exact URL into OBS Settings → Stream → Server
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
            ✅ Copy this into OBS Settings → Stream → Stream Key
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
          <h4 className="font-medium text-slate-300 mb-3">📋 Exact OBS Setup Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
            {obsSetup.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Final Success Message */}
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-green-400 font-medium">
              Perfect! Your OBS is now configured for professional streaming.
            </p>
          </div>
          <p className="text-sm text-green-300 mt-2">
            Click "Start Streaming" in OBS to go live on Night Flow!
          </p>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
