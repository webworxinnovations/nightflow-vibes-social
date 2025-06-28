
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
      details: 'Testing DigitalOcean droplet streaming server connectivity...',
      nextSteps: []
    });

    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      dropletIP: '67.205.179.77',
      domain: 'nightflow-app-wijb2.ondigitalocean.app'
    };

    try {
      // Test 1: Check if the DigitalOcean app is responding via domain
      console.log('🧪 Test 1: DigitalOcean app health check via domain...');
      try {
        const healthResponse = await fetch('https://nightflow-app-wijb2.ondigitalocean.app/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.domainHealthCheck = {
          status: healthResponse.status,
          success: healthResponse.ok,
          statusText: healthResponse.statusText,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/health'
        };
        console.log('✅ Domain health check:', debugResults.tests.domainHealthCheck);
      } catch (error) {
        debugResults.tests.domainHealthCheck = {
          error: error instanceof Error ? error.message : 'Connection failed',
          success: false,
          url: 'https://nightflow-app-wijb2.ondigitalocean.app/health'
        };
        console.log('❌ Domain health check failed:', debugResults.tests.domainHealthCheck);
      }

      // Test 2: Check RTMP server status via IP
      console.log('🧪 Test 2: RTMP server via direct IP...');
      try {
        const rtmpResponse = await fetch('http://67.205.179.77:8888/api/server/stats', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        const rtmpData = await rtmpResponse.json();
        debugResults.tests.rtmpViaIP = {
          success: rtmpResponse.ok,
          data: rtmpData,
          url: 'http://67.205.179.77:8888/api/server/stats'
        };
        console.log('📡 RTMP via IP test:', debugResults.tests.rtmpViaIP);
      } catch (error) {
        debugResults.tests.rtmpViaIP = {
          error: error instanceof Error ? error.message : 'RTMP via IP failed',
          success: false,
          url: 'http://67.205.179.77:8888/api/server/stats'
        };
        console.log('❌ RTMP via IP test failed:', debugResults.tests.rtmpViaIP);
      }

      // Analyze results and provide status
      const domainWorking = debugResults.tests.domainHealthCheck.success;
      const rtmpWorking = debugResults.tests.rtmpViaIP.success;

      if (domainWorking && rtmpWorking) {
        console.log('✅ DigitalOcean droplet is fully operational');
        onStatusUpdate({
          status: 'online',
          details: 'DigitalOcean droplet is running and RTMP server is operational',
          nextSteps: [
            '✅ Server: Online via domain',
            '✅ RTMP server: Running on droplet IP',
            '🎯 OBS should connect to: rtmp://67.205.179.77:1935/live',
            '💡 Domain works for web, IP works for RTMP',
            '🔄 Try streaming from OBS now'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ DigitalOcean droplet is online and ready for streaming!');
        
      } else if (domainWorking && !rtmpWorking) {
        console.log('⚠️ Domain online but RTMP server needs attention');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'Domain accessible but RTMP server not responding on droplet IP',
          nextSteps: [
            '✅ Domain: Online (nightflow-app-wijb2.ondigitalocean.app)',
            '❌ RTMP server: Not responding on 67.205.179.77:8888',
            '🔧 The RTMP streaming service may need restart on droplet',
            '🔄 Check droplet directly via SSH',
            '💡 Domain vs IP configuration issue'
          ],
          debugInfo: debugResults
        });
        toast.warning('⚠️ RTMP server on droplet needs attention');
        
      } else {
        console.log('❌ DigitalOcean services not responding properly');
        onStatusUpdate({
          status: 'offline',
          details: 'DigitalOcean services not responding as expected',
          nextSteps: [
            '❌ Domain: Issues with nightflow-app-wijb2.ondigitalocean.app',
            '❌ RTMP server: Not reachable on 67.205.179.77',
            '⚠️ Check DigitalOcean dashboard for droplet status',
            '🔍 Verify both app and droplet are running',
            '🔄 May need to restart services'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ DigitalOcean services appear to be offline');
      }

    } catch (error) {
      console.error('❌ Comprehensive server check failed:', error);
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
          Target: 67.205.179.77:1935 (RTMP) + nightflow-app-wijb2.ondigitalocean.app (Web)
        </div>
      )}
    </div>
  );
};
