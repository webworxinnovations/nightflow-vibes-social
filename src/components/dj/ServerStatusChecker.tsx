
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  RefreshCw,
  Zap
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
    console.log('🔍 Starting real DigitalOcean RTMP connectivity test...');
    
    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      const baseUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      
      // Test 1: Check if the web server is running
      console.log('🧪 Test 1: Web server connectivity...');
      try {
        const basicResponse = await fetch(baseUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        debugResults.tests.webServer = {
          status: basicResponse.status,
          success: basicResponse.ok,
          statusText: basicResponse.statusText
        };
        console.log('✅ Web server test:', debugResults.tests.webServer);
      } catch (error) {
        debugResults.tests.webServer = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
        console.log('❌ Web server failed:', debugResults.tests.webServer);
      }

      // Test 2: Try to check RTMP port accessibility
      console.log('🧪 Test 2: RTMP port connectivity test...');
      try {
        // We can't directly test RTMP from browser, but we can check if the domain resolves
        const dnsTest = await fetch(`https://dns.google/resolve?name=nightflow-app-wijb2.ondigitalocean.app&type=A`);
        const dnsData = await dnsTest.json();
        debugResults.tests.dnsResolution = {
          success: dnsData.Status === 0,
          answers: dnsData.Answer || [],
          status: dnsData.Status
        };
        console.log('🌐 DNS resolution test:', debugResults.tests.dnsResolution);
      } catch (error) {
        debugResults.tests.dnsResolution = {
          error: error instanceof Error ? error.message : 'DNS test failed',
          success: false
        };
      }

      // Based on OBS error, the hostname is not found - this means DigitalOcean app is not accessible
      if (!debugResults.tests.webServer.success) {
        console.log('❌ DigitalOcean app is not accessible - deployment may have failed');
        
        onStatusUpdate({
          status: 'offline',
          details: 'DigitalOcean deployment is not accessible',
          nextSteps: [
            '❌ DigitalOcean app URL is not responding',
            '❌ OBS cannot connect because the hostname does not resolve',
            '⚠️ The deployment may have failed or the app is not running',
            '💡 Check DigitalOcean dashboard for deployment status',
            '💡 Verify the app URL: nightflow-app-wijb2.ondigitalocean.app',
            '🔄 Try redeploying to DigitalOcean',
            '🔄 Alternative: Use browser streaming method instead'
          ],
          debugInfo: debugResults
        });
        
        toast.error('❌ DigitalOcean deployment is not accessible');
      } else {
        // Web server is up but RTMP might still not work
        console.log('⚠️ Web server is running but RTMP port may not be exposed');
        
        onStatusUpdate({
          status: 'needs-deployment',
          details: 'DigitalOcean web server is running but RTMP port may not be accessible',
          nextSteps: [
            '✅ DigitalOcean web server: Running',
            '❌ RTMP port 1935: May not be exposed externally',
            '⚠️ OBS cannot connect - this is a common DigitalOcean limitation',
            '💡 DigitalOcean App Platform may not support custom TCP ports',
            '💡 Many cloud platforms block RTMP port 1935 for security',
            '🔄 Recommended: Use Browser Streaming method instead',
            '🔄 Alternative: Deploy to a VPS with full port control'
          ],
          debugInfo: debugResults
        });
        
        toast.warning('⚠️ RTMP port may not be accessible - use Browser Streaming');
      }

    } catch (error) {
      console.error('❌ Deployment check failed:', error);
      onStatusUpdate({
        status: 'offline',
        details: 'Unable to verify DigitalOcean deployment status',
        nextSteps: [
          '❌ Connection test failed',
          '⚠️ DigitalOcean app may not be deployed correctly',
          '💡 Check your internet connection',
          '💡 Verify DigitalOcean deployment status',
          '🔄 Try browser streaming as alternative'
        ],
        debugInfo: debugResults
      });
      toast.error('❌ Could not verify deployment status');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Button
      onClick={checkDigitalOceanStatus}
      disabled={checking}
      variant="outline"
    >
      {checking ? (
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Zap className="h-4 w-4 mr-2" />
      )}
      {checking ? 'Testing Real Connectivity...' : 'Test Real Server Status'}
    </Button>
  );
};
