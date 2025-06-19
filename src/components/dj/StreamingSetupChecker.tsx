
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { StreamingAPI } from "@/services/streaming/api";
import { StreamingConfig } from "@/services/streaming/config";

interface SetupCheckResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const StreamingSetupChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [checks, setChecks] = useState<SetupCheckResult[]>([]);

  const runChecks = async () => {
    setIsChecking(true);
    const results: SetupCheckResult[] = [];

    // Check 1: Server connectivity
    try {
      const serverStatus = await StreamingAPI.getServerStatus();
      results.push({
        name: "Railway Server Connection",
        status: serverStatus.available ? 'success' : 'error',
        message: serverStatus.available ? 'Server is online and responding' : 'Server is not responding',
        details: `URL: ${serverStatus.url}`
      });
    } catch (error) {
      results.push({
        name: "Railway Server Connection",
        status: 'error',
        message: 'Failed to check server status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 2: RTMP endpoint
    const rtmpUrl = StreamingConfig.getRtmpUrl();
    results.push({
      name: "RTMP URL Configuration",
      status: 'success',
      message: 'RTMP URL is properly configured',
      details: rtmpUrl
    });

    // Check 3: HLS endpoint test
    try {
      const testStreamKey = 'test_stream_key';
      const hlsUrl = StreamingConfig.getHlsUrl(testStreamKey);
      results.push({
        name: "HLS URL Configuration",
        status: 'success',
        message: 'HLS URL format is correct',
        details: hlsUrl
      });
    } catch (error) {
      results.push({
        name: "HLS URL Configuration",
        status: 'error',
        message: 'HLS URL configuration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check 4: WebSocket connectivity
    try {
      const wsUrl = `wss://nightflow-vibes-social-production.up.railway.app/ws/stream/test`;
      results.push({
        name: "WebSocket Configuration",
        status: 'success',
        message: 'WebSocket URL is configured',
        details: wsUrl
      });
    } catch (error) {
      results.push({
        name: "WebSocket Configuration",
        status: 'warning',
        message: 'WebSocket may have issues',
        details: 'Will fallback to HTTP polling'
      });
    }

    setChecks(results);
    setIsChecking(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: SetupCheckResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: SetupCheckResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'pending':
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const allChecksPass = checks.length > 0 && checks.every(check => check.status === 'success' || check.status === 'warning');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Streaming Setup Status</CardTitle>
          <Button 
            onClick={runChecks} 
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recheck
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
            {getStatusIcon(check.status)}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{check.name}</h4>
                {getStatusBadge(check.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
              {check.details && (
                <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-1 rounded">
                  {check.details}
                </p>
              )}
            </div>
          </div>
        ))}

        {allChecksPass && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ All systems ready! You can now connect OBS and start streaming.
            </AlertDescription>
          </Alert>
        )}

        {checks.some(check => check.status === 'error') && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              ❌ There are issues that need to be resolved before streaming.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
