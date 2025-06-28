
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

  const checkDigitalOceanApp = async () => {
    setChecking(true);
    console.log('🔍 Testing DigitalOcean app at nightflow-app-wijb2.ondigitalocean.app...');
    
    onStatusUpdate({
      status: 'checking',
      details: 'Testing DigitalOcean app streaming server connectivity...',
      nextSteps: []
    });

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      appUrl: 'nightflow-app-wijb2.ondigitalocean.app'
    };

    try {
      // Test 1: Check if the DigitalOcean app is responding
      console.log('🧪 Test 1: DigitalOcean app health check...');
      try {
        const healthResponse = await fetch('https://nightflow-app-wijb2.ondigitalocean.app/health', {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        debugResults.tests.appHealthCheck = {
          status: healthResponse.status,
          success: healthResponse.ok,
          statusText: healthResponse.statusText,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/health'
        };
        console.log('✅ App health check:', debugResults.tests.appHealthCheck);
      } catch (error) {
        debugResults.tests.appHealthCheck = {
          error: error instanceof Error ? error.message : 'Connection failed',
          success: false,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/health'
        };
        console.log('❌ App health check failed:', debugResults.tests.appHealthCheck);
      }

      // Test 2: Check server stats API
      console.log('🧪 Test 2: Server stats API...');
      try {
        const statsResponse = await fetch('https://nightflow-app-wijb2.ondigitalocean.app/api/server/stats', {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        const statsData = await statsResponse.json();
        debugResults.tests.serverStats = {
          success: statsResponse.ok,
          data: statsData,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/api/server/stats'
        };
        console.log('📡 Server stats test:', debugResults.tests.serverStats);
      } catch (error) {
        debugResults.tests.serverStats = {
          error: error instanceof Error ? error.message : 'Server stats failed',
          success: false,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/api/server/stats'
        };
        console.log('❌ Server stats test failed:', debugResults.tests.serverStats);
      }

      // Analyze results and provide status
      const appWorking = debugResults.tests.appHealthCheck.success;
      const statsWorking = debugResults.tests.serverStats.success;

      if (appWorking && statsWorking) {
        console.log('✅ DigitalOcean app is fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'DigitalOcean app is running and streaming server is operational',
          nextSteps: [
            '✅ App: Online via HTTPS',
            '✅ Streaming server: Running and accessible',
            '🎯 OBS should connect to: rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live',
            '💡 All services confirmed operational',
            '🔄 Try streaming from OBS now'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ DigitalOcean app is online and ready for streaming!');
        
      } else if (appWorking && !statsWorking) {
        console.log('⚠️ App online but streaming server needs attention');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'App accessible but streaming server not responding properly',
          nextSteps: [
            '✅ App: Online (nightflow-app-wijb2.ondigitalocean.app)',
            '❌ Streaming API: Not responding properly',
            '🔧 The streaming service may need restart',
            '🔄 Check app logs in DigitalOcean dashboard',
            '💡 App vs streaming service configuration issue'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ Streaming server on app needs attention');
        
      } else {
        console.log('❌ DigitalOcean app not responding properly');
        onStatusUpdate({
          status: 'offline',
          details: 'DigitalOcean app not responding as expected',
          nextSteps: [
            '❌ App: Issues with nightflow-app-wijb2.ondigitalocean.app',
            '❌ Streaming server: Not reachable',
            '⚠️ Check DigitalOcean dashboard for app status',
            '🔍 Verify app is running and properly deployed',
            '🔄 May need to restart app or check logs'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ DigitalOcean app appears to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive app check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to test DigitalOcean app connectivity',
        nextSteps: [
          '❌ Connection test completely failed',
          '🌐 Check your internet connection',
          '💡 App may be unreachable or crashed',
          '🔍 Verify app status in DigitalOcean dashboard'
        ],
        debugInfo: debugResults
      });
      toast.error('❌ Could not test app connectivity');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={checkDigitalOceanApp}
        disabled={checking}
        variant="outline"
        size="sm"
      >
        {checking ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        {checking ? 'Testing App...' : 'Test DigitalOcean App'}
      </Button>
      
      {!checking && (
        <div className="text-xs text-muted-foreground">
          Target: nightflow-app-wijb2.ondigitalocean.app (HTTPS)
        </div>
      )}
    </div>
  );
};
