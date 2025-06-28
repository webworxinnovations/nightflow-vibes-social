
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

  const checkDropletStatus = async () => {
    setChecking(true);
    console.log('🔍 Testing DigitalOcean droplet at 67.205.179.77...');
    
    onStatusUpdate({
      status: 'checking',
      details: 'Testing DigitalOcean droplet connectivity...',
      nextSteps: []
    });

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      dropletIP: '67.205.179.77'
    };

    try {
      // Test 1: Check if the droplet is responding
      console.log('🧪 Test 1: Droplet health check...');
      try {
        const healthResponse = await fetch('http://67.205.179.77:3001/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.healthCheck = {
          status: healthResponse.status,
          success: healthResponse.ok,
          statusText: healthResponse.statusText,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('✅ Droplet health check:', debugResults.tests.healthCheck);
      } catch (error) {
        debugResults.tests.healthCheck = {
          error: error instanceof Error ? error.message : 'Connection failed',
          success: false,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('❌ Droplet health check failed:', debugResults.tests.healthCheck);
      }

      // Test 2: Check RTMP server status endpoint
      console.log('🧪 Test 2: RTMP server status...');
      try {
        const rtmpResponse = await fetch('http://67.205.179.77:3001/api/rtmp/stats', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        const rtmpData = await rtmpResponse.json();
        debugResults.tests.rtmpServer = {
          success: rtmpResponse.ok,
          data: rtmpData,
          url: 'http://67.205.179.77:3001/api/rtmp/stats'
        };
        console.log('📡 RTMP server test:', debugResults.tests.rtmpServer);
      } catch (error) {
        debugResults.tests.rtmpServer = {
          error: error instanceof Error ? error.message : 'RTMP status check failed',
          success: false,
          url: 'http://67.205.179.77:3001/api/rtmp/stats'
        };
        console.log('❌ RTMP server test failed:', debugResults.tests.rtmpServer);
      }

      // Analyze results and provide status
      const healthCheckWorking = debugResults.tests.healthCheck.success;
      const rtmpServerWorking = debugResults.tests.rtmpServer.success;

      if (healthCheckWorking && rtmpServerWorking) {
        console.log('✅ DigitalOcean droplet is fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'DigitalOcean droplet is running and RTMP server is operational',
          nextSteps: [
            '✅ Droplet: Online',
            '✅ RTMP server: Running',
            '🎯 OBS should connect to: rtmp://67.205.179.77:1935/live',
            '💡 Make sure OBS is set to "Start Streaming"',
            '🔄 Try refreshing your stream if it was already running'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ DigitalOcean droplet is online!');
        
      } else if (healthCheckWorking && !rtmpServerWorking) {
        console.log('⚠️ Droplet online but RTMP server needs attention');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'Droplet is online but RTMP server is not responding properly',
          nextSteps: [
            '✅ Droplet: Online',
            '❌ RTMP server: Not responding',
            '🔧 The RTMP streaming service may need restart',
            '🔄 Check droplet logs for RTMP errors',
            '💡 RTMP service might be running on different port'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ RTMP server needs attention');
        
      } else {
        console.log('❌ DigitalOcean droplet is not responding');
        onStatusUpdate({
          status: 'offline',
          details: 'DigitalOcean droplet is not responding',
          nextSteps: [
            '❌ Droplet: Offline',
            '❌ RTMP server: Offline',
            '⚠️ Check DigitalOcean dashboard for droplet status',
            '🔍 Verify droplet is running at 67.205.179.77',
            '🔄 Try restarting the droplet from DigitalOcean dashboard'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ DigitalOcean droplet appears to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive droplet check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to test DigitalOcean droplet connectivity',
        nextSteps: [
          '❌ Connection test completely failed',
          '🌐 Check your internet connection',
          '💡 Droplet may be unreachable',
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
        onClick={checkDropletStatus}
        disabled={checking}
        variant="outline"
        size="sm"
      >
        {checking ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        {checking ? 'Testing Droplet...' : 'Test Droplet Server'}
      </Button>
      
      {!checking && (
        <div className="text-xs text-muted-foreground">
          Target: 67.205.179.77:1935
        </div>
      )}
    </div>
  );
};
