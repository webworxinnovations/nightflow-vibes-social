
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  RefreshCw,
  Zap,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface ServerStatusCheckerProps {
  onStatusUpdate: (status: {
    status: 'checking' | 'online' | 'offline' | 'needs-deployment';
    details: string;
    nextSteps: string[];
    debugInfo?: any;
  }) => void;
}

export const ServerStatusChecker = ({ onStatusUpdate }: ServerStatusCheckerProps) => {
  const [checking, setChecking] = useState(false);

  const checkDigitalOceanStatus = async () => {
    setChecking(true);
    console.log('🔍 Testing DigitalOcean streaming server at nightflow-app-wijb2.ondigitalocean.app...');
    
    onStatusUpdate({
      status: 'checking',
      details: 'Testing DigitalOcean streaming server connectivity...',
      nextSteps: []
    });

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      serverDomain: 'nightflow-app-wijb2.ondigitalocean.app'
    };

    try {
      // Test 1: Check if the DigitalOcean app is responding
      console.log('🧪 Test 1: DigitalOcean app health check...');
      try {
        const healthResponse = await fetch('https://nightflow-app-wijb2.ondigitalocean.app/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.healthCheck = {
          status: healthResponse.status,
          success: healthResponse.ok,
          statusText: healthResponse.statusText,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/health'
        };
        console.log('✅ DigitalOcean health check:', debugResults.tests.healthCheck);
      } catch (error) {
        debugResults.tests.healthCheck = {
          error: error instanceof Error ? error.message : 'Connection failed',
          success: false,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/health'
        };
        console.log('❌ DigitalOcean health check failed:', debugResults.tests.healthCheck);
      }

      // Test 2: Check RTMP server status endpoint
      console.log('🧪 Test 2: RTMP server status...');
      try {
        const rtmpResponse = await fetch('https://nightflow-app-wijb2.ondigitalocean.app/api/rtmp/stats', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        const rtmpData = await rtmpResponse.json();
        debugResults.tests.rtmpServer = {
          success: rtmpResponse.ok,
          data: rtmpData,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/api/rtmp/stats'
        };
        console.log('📡 RTMP server test:', debugResults.tests.rtmpServer);
      } catch (error) {
        debugResults.tests.rtmpServer = {
          error: error instanceof Error ? error.message : 'RTMP status check failed',
          success: false,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/api/rtmp/stats'
        };
        console.log('❌ RTMP server test failed:', debugResults.tests.rtmpServer);
      }

      // Analyze results and provide status
      const healthCheckWorking = debugResults.tests.healthCheck.success;
      const rtmpServerWorking = debugResults.tests.rtmpServer.success;

      if (healthCheckWorking && rtmpServerWorking) {
        console.log('✅ DigitalOcean streaming server is fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'DigitalOcean streaming server is running and RTMP server is operational',
          nextSteps: [
            '✅ DigitalOcean app: Online',
            '✅ RTMP server: Running',
            '🎯 OBS should connect to: rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live',
            '💡 Update your OBS server URL if you were using the old IP address',
            '💡 Make sure OBS is set to "Start Streaming"'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ DigitalOcean streaming server is online!');
        
      } else if (healthCheckWorking && !rtmpServerWorking) {
        console.log('⚠️ DigitalOcean app online but RTMP server needs attention');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'DigitalOcean app is online but RTMP server is not responding properly',
          nextSteps: [
            '✅ DigitalOcean app: Online',
            '❌ RTMP server: Not responding',
            '🔧 The RTMP streaming service may need restart',
            '🔄 Check DigitalOcean deployment logs for RTMP errors',
            '💡 RTMP service might be running on different port'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ RTMP server needs attention');
        
      } else {
        console.log('❌ DigitalOcean streaming server is not responding');
        onStatusUpdate({
          status: 'offline',
          details: 'DigitalOcean streaming server is not responding',
          nextSteps: [
            '❌ DigitalOcean app: Offline',
            '❌ RTMP server: Offline',
            '⚠️ Check DigitalOcean dashboard for deployment status',
            '🔍 Verify app is running at nightflow-app-wijb2.ondigitalocean.app',
            '🔄 Try redeploying from DigitalOcean dashboard'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ DigitalOcean streaming server appears to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive server check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to test DigitalOcean streaming server connectivity',
        nextSteps: [
          '❌ Connection test completely failed',
          '🌐 Check your internet connection',
          '💡 DigitalOcean app may be unreachable',
          '🔍 Verify app status in DigitalOcean dashboard'
        ],
        debugInfo: debugResults
      });
      toast.error('❌ Could not test server connectivity');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={checkDigitalOceanStatus}
        disabled={checking}
        variant="outline"
        size="sm"
      >
        {checking ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        {checking ? 'Testing Server...' : 'Test DigitalOcean Server'}
      </Button>
      
      {!checking && (
        <div className="text-xs text-muted-foreground">
          Target: nightflow-app-wijb2.ondigitalocean.app:1935
        </div>
      )}
    </div>
  );
};
