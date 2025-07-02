
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
      // Test 1: HTTPS Health Check
      console.log('🧪 Test 1: HTTPS health check...');
      try {
        const httpsResponse = await fetch('https://67.205.179.77:3443/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.httpsHealthCheck = {
          status: httpsResponse.status,
          success: httpsResponse.ok,
          statusText: httpsResponse.statusText,
          url: 'https://67.205.179.77:3443/health',
          responseText: await httpsResponse.text().catch(() => 'Could not read response')
        };
        console.log('✅ HTTPS health check result:', debugResults.tests.httpsHealthCheck);
      } catch (error) {
        debugResults.tests.httpsHealthCheck = {
          error: error instanceof Error ? error.message : 'HTTPS connection failed',
          success: false,
          url: 'https://67.205.179.77:3443/health'
        };
        console.log('❌ HTTPS health check failed:', debugResults.tests.httpsHealthCheck);
      }

      // Test 2: HTTP Health Check (fallback)
      console.log('🧪 Test 2: HTTP health check...');
      try {
        const httpResponse = await fetch('http://67.205.179.77:3001/health', {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
        debugResults.tests.httpHealthCheck = {
          status: httpResponse.status,
          success: httpResponse.ok,
          statusText: httpResponse.statusText,
          url: 'http://67.205.179.77:3001/health',
          responseText: await httpResponse.text().catch(() => 'Could not read response')
        };
        console.log('✅ HTTP health check result:', debugResults.tests.httpHealthCheck);
      } catch (error) {
        debugResults.tests.httpHealthCheck = {
          error: error instanceof Error ? error.message : 'HTTP connection failed',
          success: false,
          url: 'http://67.205.179.77:3001/health'
        };
        console.log('❌ HTTP health check failed:', debugResults.tests.httpHealthCheck);
      }

      // Test 3: RTMP Server Status
      console.log('🧪 Test 3: RTMP server status...');
      const rtmpEndpoints = [
        'https://67.205.179.77:3443/api/rtmp/status',
        'http://67.205.179.77:3001/api/rtmp/status'
      ];
      
      for (const endpoint of rtmpEndpoints) {
        try {
          const rtmpResponse = await fetch(endpoint, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          const rtmpData = await rtmpResponse.json().catch(() => ({}));
          debugResults.tests.rtmpStatus = {
            success: rtmpResponse.ok,
            data: rtmpData,
            url: endpoint,
            protocol: endpoint.includes('https') ? 'HTTPS' : 'HTTP'
          };
          console.log('📡 RTMP status test result:', debugResults.tests.rtmpStatus);
          if (rtmpResponse.ok) break; // Use first successful response
        } catch (error) {
          debugResults.tests.rtmpStatus = {
            error: error instanceof Error ? error.message : 'RTMP status failed',
            success: false,
            url: endpoint
          };
        }
      }

      // Analyze results and provide recommendations
      const httpsWorking = debugResults.tests.httpsHealthCheck?.success;
      const httpWorking = debugResults.tests.httpHealthCheck?.success;
      const rtmpWorking = debugResults.tests.rtmpStatus?.success;

      if (httpsWorking && rtmpWorking) {
        console.log('✅ Droplet fully operational with HTTPS');
        onStatusUpdate({
          status: 'online',
          details: 'Your droplet server is fully operational with HTTPS and RTMP support',
          nextSteps: [
            '✅ Droplet: Online with HTTPS (67.205.179.77:3443)',
            '✅ RTMP server: Ready for OBS connections',
            '✅ All services confirmed operational',
            '🎯 Next: Generate stream key and configure OBS',
            '📡 OBS Server: rtmp://67.205.179.77:1935/live',
            '🔄 After connecting OBS, check for your stream in NightFlow'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ Your droplet server is fully operational and ready for streaming!');
        
      } else if (httpWorking && rtmpWorking) {
        console.log('⚠️ HTTP working but HTTPS has issues');
        onStatusUpdate({
          status: 'online',
          details: 'Droplet accessible via HTTP, HTTPS needs attention but streaming should work',
          nextSteps: [
            '✅ Droplet: Online via HTTP (67.205.179.77:3001)',
            '✅ RTMP server: Ready for OBS connections',
            '⚠️ HTTPS: Has connection issues (not critical for OBS)',
            '🎯 Next: Generate stream key and configure OBS',
            '📡 OBS Server: rtmp://67.205.179.77:1935/live',
            '💡 Streaming will work - HTTPS is only needed for web interface'
          ],
          debugInfo: debugResults
        });
        toast.success('✅ Your droplet server is ready for streaming (HTTP working)!');
        
      } else if (httpWorking || httpsWorking) {
        console.log('⚠️ Partial connectivity - server alive but RTMP issues');
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'Droplet server responding but RTMP service may need restart',
          nextSteps: [
            httpWorking ? '✅ HTTP: Working' : '❌ HTTP: Issues',
            httpsWorking ? '✅ HTTPS: Working' : '❌ HTTPS: Issues',
            '❌ RTMP API: Not responding properly',
            '🔧 The RTMP streaming service may need restart',
            '💡 Your server is running but streaming services need attention',
            '🔄 Try restarting your streaming server'
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
            '❌ HTTPS: Cannot connect to 67.205.179.77:3443',
            '❌ HTTP: Cannot connect to 67.205.179.77:3001',
            '❌ RTMP: Not accessible',
            '⚠️ Your droplet server appears to be completely offline',
            '🔍 Check DigitalOcean dashboard - droplet may be stopped',
            '💡 Server may have crashed or been terminated'
          ],
          debugInfo: debugResults
        });
        toast.error('❌ Your droplet server appears to be completely offline');
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
          Comprehensive Test: HTTPS, HTTP, RTMP
        </div>
      )}
    </div>
  );
};
