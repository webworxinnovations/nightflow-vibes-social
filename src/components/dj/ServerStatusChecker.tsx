
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
    console.log('🔍 Testing DigitalOcean droplet RTMP server at 67.205.179.77...');
    
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
      // Test 1: Check if the droplet web server is responding
      console.log('🧪 Test 1: DigitalOcean droplet web server...');
      try {
        const webResponse = await fetch('http://67.205.179.77:3001/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.webServer = {
          status: webResponse.status,
          success: webResponse.ok,
          statusText: webResponse.statusText,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('✅ Droplet web server test:', debugResults.tests.webServer);
      } catch (error) {
        debugResults.tests.webServer = {
          error: error instanceof Error ? error.message : 'Connection failed',
          success: false,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('❌ Droplet web server failed:', debugResults.tests.webServer);
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
      const webServerWorking = debugResults.tests.webServer.success;
      const rtmpServerWorking = debugResults.tests.rtmpServer.success;

      if (webServerWorking && rtmpServerWorking) {
        console.log('✅ DigitalOcean droplet is fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'DigitalOcean droplet is running and RTMP server is operational',
          nextSteps: [
            '✅ Droplet web server: Online',
            '✅ RTMP server: Running',
            '🎯 OBS should be able to connect to: rtmp://67.205.179.77:1935/live',
            '💡 If OBS still can\'t connect, check your stream key',
            '💡 Make sure OBS is set to "Start Streaming" not "Stop Streaming"'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ DigitalOcean streaming server is online!');
        
      } else if (webServerWorking && !rtmpServerWorking) {
        console.log('⚠️ Droplet web server online but RTMP server may have issues');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'DigitalOcean droplet is online but RTMP server is not responding properly',
          nextSteps: [
            '✅ Droplet web server: Online',
            '❌ RTMP server: Not responding',
            '🔧 The RTMP streaming service may have crashed',
            '🔄 Try restarting the RTMP service on the droplet',
            '💡 SSH into droplet and check: sudo systemctl status rtmp-server',
            '🔄 Restart with: sudo systemctl restart rtmp-server'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ RTMP server needs attention');
        
      } else {
        console.log('❌ DigitalOcean droplet is not responding');
        onStatusUpdate({
          status: 'offline',
          details: 'DigitalOcean droplet is not responding at 67.205.179.77',
          nextSteps: [
            '❌ Droplet web server: Offline',
            '❌ RTMP server: Offline',
            '⚠️ The entire droplet may be down or misconfigured',
            '🔍 Check DigitalOcean dashboard for droplet status',
            '💡 Verify droplet is powered on and running',
            '🔄 Try restarting the droplet from DigitalOcean dashboard',
            '🌐 Check if IP address 67.205.179.77 is correct'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ DigitalOcean droplet appears to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive server check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to test DigitalOcean droplet connectivity',
        nextSteps: [
          '❌ Connection test completely failed',
          '🌐 Check your internet connection',
          '💡 DigitalOcean droplet may be completely unreachable',
          '🔍 Verify droplet status in DigitalOcean dashboard',
          '📋 Confirm droplet IP is 67.205.179.77'
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
        {checking ? 'Testing Droplet...' : 'Test DigitalOcean Droplet'}
      </Button>
      
      {!checking && (
        <div className="text-xs text-muted-foreground">
          Target: 67.205.179.77:1935
        </div>
      )}
    </div>
  );
};
