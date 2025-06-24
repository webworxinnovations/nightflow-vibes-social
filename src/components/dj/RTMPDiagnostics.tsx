
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  TestTube, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Network,
  Server,
  Zap
} from "lucide-react";
import { RTMPTester } from "@/services/streaming/rtmpTester";
import { toast } from "sonner";

interface RTMPDiagnosticsProps {
  rtmpUrl: string;
  serverUrl: string;
  streamKey: string;
}

export const RTMPDiagnostics = ({ rtmpUrl, serverUrl, streamKey }: RTMPDiagnosticsProps) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runRTMPTest = async () => {
    setTesting(true);
    setTestResult(null);
    setDiagnostics(null);

    try {
      console.log('🔍 Starting comprehensive RTMP diagnostics...');
      
      // Run basic connectivity test
      const connectivityResult = await RTMPTester.testRTMPConnectivity(rtmpUrl);
      setTestResult(connectivityResult);
      
      // Run advanced diagnostics
      const advancedResult = await RTMPTester.performAdvancedDiagnostics(serverUrl);
      setDiagnostics(advancedResult);

      if (connectivityResult.success) {
        toast.success('RTMP connectivity test passed! Try OBS connection now.');
      } else {
        toast.error('RTMP connectivity issues detected - see diagnostics below');
      }

    } catch (error) {
      console.error('❌ RTMP diagnostics failed:', error);
      toast.error('Diagnostics test failed');
      setTestResult({
        success: false,
        details: 'Diagnostics test failed',
        suggestions: ['Check internet connection and try again']
      });
    } finally {
      setTesting(false);
    }
  };

  // Extract server URL without /live for OBS
  const getObsServerUrl = (rtmpUrl: string) => {
    return rtmpUrl.replace('/live', '');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            RTMP Connection Diagnostics
          </CardTitle>
          <Button 
            onClick={runRTMPTest}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {testing ? 'Testing...' : 'Run Diagnostics'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Details */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Network className="h-4 w-4" />
            Connection Details
          </h4>
          <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded">
            <p><strong>OBS Server URL:</strong> {getObsServerUrl(rtmpUrl)}</p>
            <p><strong>Full RTMP URL:</strong> {rtmpUrl}</p>
            <p><strong>Stream Key:</strong> {streamKey.substring(0, 8)}...{streamKey.slice(-4)}</p>
            <p><strong>Server:</strong> {serverUrl}</p>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <h4 className="font-medium">
                  {testResult.success ? 'Connection Test Passed' : 'Connection Issues Detected'}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{testResult.details}</p>
              
              {testResult.suggestions && testResult.suggestions.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Recommendations:</h5>
                  <ul className="text-sm space-y-1">
                    {testResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Diagnostics */}
        {diagnostics && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Server Diagnostics
            </h4>
            
            {/* RTMP Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">RTMP Server Status</span>
              <Badge variant={diagnostics.rtmpStatus.ready ? "default" : "destructive"}>
                {diagnostics.rtmpStatus.ready ? 'Ready' : 'Not Ready'}
              </Badge>
            </div>

            {/* Server Info */}
            {diagnostics.serverInfo && (
              <details className="border rounded-lg">
                <summary className="p-3 cursor-pointer font-medium">
                  Server Information (Click to expand)
                </summary>
                <div className="p-3 pt-0">
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(diagnostics.serverInfo, null, 2)}
                  </pre>
                </div>
              </details>
            )}

            {/* Recommendations */}
            {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {diagnostics.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="text-sm">
                        {rec.startsWith('•') || rec.startsWith('❌') || rec.startsWith('⚠️') || rec.startsWith('🚄') ? (
                          <span>{rec}</span>
                        ) : (
                          <strong>{rec}</strong>
                        )}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* OBS Setup Reminder with Corrected Instructions */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-2">Correct OBS Setup Instructions</h4>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>1. In OBS: Settings → Stream</li>
            <li>2. Service: Select "Custom..."</li>
            <li>3. Server: <code className="bg-green-500/20 px-1 rounded text-green-400">{getObsServerUrl(rtmpUrl)}</code> (WITHOUT /live)</li>
            <li>4. Stream Key: Copy your stream key from above</li>
            <li>5. Click "Apply" and "OK"</li>
            <li>6. Click "Start Streaming" in OBS main window</li>
          </ol>
          <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs">
            <strong className="text-orange-400">⚠️ Common Mistake:</strong> Don't include "/live" in the server field - OBS adds this automatically!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
