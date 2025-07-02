
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

  const checkDropletServer = async () => {
    setChecking(true);
    console.log('🔍 Comprehensive droplet server test starting...');
    
    onStatusUpdate({
      status: 'checking',
      details: 'Testing your droplet server connectivity and services...',
      nextSteps: []
    });

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      dropletIP: '67.205.179.77'
    };

    try {
      // Test 1: HTTP Health Check on correct port 8888
      console.log('🧪 Test 1: HTTP health check on port 8888...');
      try {
        const httpResponse = await fetch('http://67.205.179.77:8888/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.httpHealthCheck = {
          status: httpResponse.status,
          success: httpResponse.ok,
          statusText: httpResponse.statusText,
          url: 'http://67.205.179.77:8888/health',
          responseText: await httpResponse.text().catch(() => 'Could not read response')
        };
        console.log('✅ HTTP health check result:', debugResults.tests.httpHealthCheck);
      } catch (error) {
        debugResults.tests.httpHealthCheck = {
          error: error instanceof Error ? error.message : 'HTTP connection failed',
          success: false,
          url: 'http://67.205.179.77:8888/health'
        };
        console.log('❌ HTTP health check failed:', debugResults.tests.httpHealthCheck);
      }

      // Test 2: RTMP Server Status on correct port
      console.log('🧪 Test 2: RTMP server status...');
      try {
        const rtmpResponse = await fetch('http://67.205.179.77:8888/api/rtmp/status', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        const rtmpData = await rtmpResponse.json().catch(() => ({}));
        debugResults.tests.rtmpStatus = {
          success: rtmpResponse.ok,
          data: rtmpData,
          url: 'http://67.205.179.77:8888/api/rtmp/status',
          protocol: 'HTTP'
        };
        console.log('📡 RTMP status test result:', debugResults.tests.rtmpStatus);
      } catch (error) {
        debugResults.tests.rtmpStatus = {
          error: error instanceof Error ? error.message : 'RTMP status failed',
          success: false,
          url: 'http://67.205.179.77:8888/api/rtmp/status'
        };
      }

      // Analyze results and provide recommendations
      const httpWorking = debugResults.tests.httpHealthCheck?.success;
      const rtmpWorking = debugResults.tests.rtmpStatus?.success;

      if (httpWorking && rtmpWorking) {
        console.log('✅ Droplet fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'Your droplet server is fully operational with HTTP and RTMP support',
          nextSteps: [
            '✅ Droplet: Online (67.205.179.77:8888)',
            '✅ RTMP server: Ready for OBS connections',
            '✅ All services confirmed operational',
            '🎯 Next: Generate stream key and configure OBS',
            '📡 OBS Server: rtmp://67.205.179.77:1935/live',
            '🔄 After connecting OBS, check for your stream in NightFlow'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ Your droplet server is fully operational and ready for streaming!');
        
      } else if (httpWorking) {
        console.log('⚠️ HTTP working but RTMP has issues');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'Droplet server responding but RTMP service may need restart',
          nextSteps: [
            '✅ HTTP: Working on port 8888',
            '❌ RTMP API: Not responding properly',
            '🔧 The RTMP streaming service may need restart',
            '💡 Your server is running but streaming services need attention',
            '🔄 Try restarting your streaming server with: pm2 restart nightflow-server'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ Server online but streaming services need restart');
        
      } else {
        console.log('❌ Complete connectivity failure');
        onStatusUpdate({
          status: 'offline',
          details: 'Cannot connect to your droplet server at all',
          nextSteps: [
            '❌ HTTP: Cannot connect to 67.205.179.77:8888',
            '❌ RTMP: Not accessible',
            '⚠️ Your droplet server appears to be offline',
            '🔍 Check DigitalOcean dashboard - droplet may be stopped',
            '💡 Server may have crashed or been terminated'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ Your droplet server appears to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive server check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to perform comprehensive server connectivity test',
        nextSteps: [
          '❌ Complete connectivity test failed',
          '🌐 Check your internet connection',
          '💡 Your droplet may be unreachable',
          '🔍 Verify droplet status in DigitalOcean dashboard'
        ],
        debugInfo: debugResults
      });
      toast.error('❌ Could not test droplet connectivity');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={checkDropletServer}
        disabled={checking}
        variant="outline"
        size="sm"
      >
        {checking ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        {checking ? 'Testing Droplet...' : 'Test Your Droplet Server'}
      </Button>
      
      {!checking && (
        <div className="text-xs text-muted-foreground">
          Test: HTTP (8888), RTMP
        </div>
      )}
    </div>
  );
};
