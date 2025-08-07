
import { useState } from "react";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { ServerStatusPanel } from "./ServerStatusPanel";
import { StreamConfigurationPanel } from "./StreamConfigurationPanel";
import { TroubleshootingGuide } from "./TroubleshootingGuide";
import { StreamDiagnostics } from "@/utils/streamDiagnostics";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Play } from "lucide-react";

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
  
  const [serverStatus, setServerStatus] = useState<{ available: boolean; url: string } | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const handleServerStatusChange = (status: { available: boolean; url: string } | null) => {
    setServerStatus(status);
  };

  const runDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      const results = await StreamDiagnostics.runCompleteTest();
      setDiagnostics(results);
      console.log('🧪 Diagnostics completed:', results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnostics Panel */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <p className="text-orange-400 font-medium">Pre-Flight Diagnostics</p>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={runningDiagnostics}
            size="sm"
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            {runningDiagnostics ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>
        
        {diagnostics && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {diagnostics.success ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span className={diagnostics.success ? 'text-green-400' : 'text-red-400'}>
                {diagnostics.success ? 'All tests passed!' : 'Issues detected'}
              </span>
            </div>
            
            <div className="grid gap-2 text-sm">
              {diagnostics.results.map((result: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  {result.status === 'pass' && <CheckCircle className="h-3 w-3 text-green-400" />}
                  {result.status === 'fail' && <XCircle className="h-3 w-3 text-red-400" />}
                  {result.status === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-400" />}
                  <span className="text-gray-300">{result.test}:</span>
                  <span className={
                    result.status === 'pass' ? 'text-green-400' : 
                    result.status === 'fail' ? 'text-red-400' : 'text-yellow-400'
                  }>
                    {result.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-3 bg-blue-400 rounded-full animate-pulse"></div>
          <p className="text-blue-400 font-medium">🔧 Debug Mode: Stream Detection Active</p>
        </div>
        <div className="text-sm text-blue-300 space-y-1">
          <p>• OBS RTMP: <code className="bg-black/20 px-2 py-1 rounded">rtmp://67.205.179.77:1935/live</code></p>
          <p>• Checking for live streams every 3 seconds</p>
          <p>• Open browser console (F12) to see detailed logs</p>
          <p>• Stream status: {isLive ? '🔴 LIVE' : '⚫ Offline'}</p>
        </div>
      </div>

      <ServerStatusPanel onStatusChange={handleServerStatusChange} />
      
      <StreamConfigurationPanel
        streamConfig={streamConfig}
        isLive={isLive}
        viewerCount={viewerCount}
        duration={duration}
        bitrate={bitrate}
        isLoading={isLoading}
        serverAvailable={serverStatus?.available ?? false}
        onGenerateKey={generateStreamKey}
        onRevokeKey={revokeStreamKey}
      />

      <TroubleshootingGuide serverAvailable={serverStatus?.available ?? false} />
    </div>
  );
};
