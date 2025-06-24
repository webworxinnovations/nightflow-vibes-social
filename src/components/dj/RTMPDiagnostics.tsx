
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TestTube, 
  RefreshCw,
  Zap
} from "lucide-react";
import { RTMPTester } from "@/services/streaming/rtmpTester";
import { toast } from "sonner";
import { ConnectionDetailsSection } from "./ConnectionDetailsSection";
import { TestResultsSection } from "./TestResultsSection";
import { ServerDiagnosticsSection } from "./ServerDiagnosticsSection";
import { OBSSetupReminder } from "./OBSSetupReminder";

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

  const obsServerUrl = getObsServerUrl(rtmpUrl);

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
        <ConnectionDetailsSection
          obsServerUrl={obsServerUrl}
          fullRtmpUrl={rtmpUrl}
          streamKey={streamKey}
          serverUrl={serverUrl}
        />

        <TestResultsSection testResult={testResult} />

        <ServerDiagnosticsSection diagnostics={diagnostics} />

        <OBSSetupReminder obsServerUrl={obsServerUrl} />
      </CardContent>
    </Card>
  );
};
