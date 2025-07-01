
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
    console.log('🔍 Testing your actual droplet server at 67.205.179.77...');
    
    onStatusUpdate({
      status: 'checking',
      details: 'Testing your actual droplet server connectivity...',
      nextSteps: []
    });

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      dropletIP: '67.205.179.77'
    };

    try {
      // Test your actual droplet server
      console.log('🧪 Test 1: Your droplet health check...');
      try {
        const healthResponse = await fetch('http://67.205.179.77:3001/health', {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        debugResults.tests.dropletHealthCheck = {
          status: healthResponse.status,
          success: healthResponse.ok,
          statusText: healthResponse.statusText,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('✅ Droplet health check:', debugResults.tests.dropletHealthCheck);
      } catch (error) {
        debugResults.tests.dropletHealthCheck = {
          error: error instanceof Error ? error.message : 'Connection failed',
          success: false,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('❌ Droplet health check failed:', debugResults.tests.dropletHealthCheck);
      }

      // Test RTMP server status
      console.log('🧪 Test 2: RTMP server status...');
      try {
        const rtmpResponse = await fetch('http://67.205.179.77:3001/api/rtmp/status', {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        const rtmpData = await rtmpResponse.json();
        debugResults.tests.rtmpStatus = {
          success: rtmpResponse.ok,
          data: rtmpData,
          url: 'http://67.205.179.77:3001/api/rtmp/status'
        };
        console.log('📡 RTMP status test:', debugResults.tests.rtmpStatus);
      } catch (error) {
        debugResults.tests.rtmpStatus = {
          error: error instanceof Error ? error.message : 'RTMP status failed',
          success: false,
          url: 'http://67.205.179.77:3001/api/rtmp/status'
        };
        console.log('❌ RTMP status test failed:', debugResults.tests.rtmpStatus);
      }

      // Analyze results
      const dropletWorking = debugResults.tests.dropletHealthCheck.success;
      const rtmpWorking = debugResults.tests.rtmpStatus.success;

      if (dropletWorking && rtmpWorking) {
        console.log('✅ Your droplet server is fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'Your droplet server is running and RTMP server is operational',
          nextSteps: [
            '✅ Droplet: Online at 67.205.179.77',
            '✅ RTMP server: Ready for OBS connections',
            '✅ API: Responding correctly',
            '🎯 OBS should connect to: rtmp://67.205.179.77:1935/live',
            '💡 All services confirmed operational',
            '🔄 Generate stream key and try OBS now'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ Your droplet server is online and ready for streaming!');
        
      } else if (dropletWorking && !rtmpWorking) {
        console.log('⚠️ Droplet online but RTMP server needs attention');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'Droplet accessible but RTMP server not responding properly',
          nextSteps: [
            '✅ Droplet: Online (67.205.179.77)',
            '❌ RTMP API: Not responding properly',
            '🔧 The RTMP service may need restart',
            '💡 Check your PowerShell window - server may have crashed',
            '🔄 Try restarting the server in PowerShell'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ RTMP server on droplet needs attention');
        
      } else {
        console.log('❌ Your droplet server not responding properly');
        onStatusUpdate({
          status: 'offline',
          details: 'Your droplet server is not responding as expected',
          nextSteps: [
            '❌ Droplet: Issues with 67.205.179.77:3001',
            '❌ RTMP server: Not reachable',
            '⚠️ Check if your PowerShell server is still running',
            '🔍 Verify the server didn\'t crash or stop',
            '🔄 Try restarting the server in PowerShell'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ Your droplet server appears to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive droplet check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to test your droplet server connectivity',
        nextSteps: [
          '❌ Connection test completely failed',
          '🌐 Check your internet connection',
          '💡 Your droplet server may be unreachable or crashed',
          '🔍 Verify server is still running in PowerShell window'
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
          Target: 67.205.179.77:3001 (Your Running Server)
        </div>
      )}
    </div>
  );
};
