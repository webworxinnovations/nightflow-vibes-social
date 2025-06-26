
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cloud, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";

export const DigitalOceanDeploymentHelper = () => {
  const [checking, setChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    status: 'checking' | 'online' | 'offline' | 'needs-deployment';
    details: string;
    nextSteps: string[];
    debugInfo?: any;
  }>({ status: 'checking', details: '', nextSteps: [] });

  const checkDigitalOceanStatus = async () => {
    setChecking(true);
    console.log('🔍 Starting comprehensive DigitalOcean deployment check...');
    
    const debugResults: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      const baseUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      
      // Test 1: Basic connectivity
      console.log('🧪 Test 1: Basic app connectivity...');
      try {
        const basicResponse = await fetch(baseUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000)
        });
        debugResults.tests.basicConnectivity = {
          status: basicResponse.status,
          success: basicResponse.ok,
          statusText: basicResponse.statusText
        };
        console.log('✅ Basic connectivity:', debugResults.tests.basicConnectivity);
      } catch (error) {
        debugResults.tests.basicConnectivity = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
        console.log('❌ Basic connectivity failed:', debugResults.tests.basicConnectivity);
      }

      // Test 2: Health endpoint
      console.log('🧪 Test 2: Health endpoint...');
      try {
        const healthResponse = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          debugResults.tests.health = {
            status: healthResponse.status,
            success: true,
            data: healthData
          };
          console.log('✅ Health check passed:', debugResults.tests.health);
          
          setServerStatus({
            status: 'online',
            details: 'DigitalOcean streaming server is online and responding!',
            nextSteps: [
              '✅ Server deployment successful',
              '✅ Health check passing',
              '✅ Ready to generate stream keys',
              '✅ OBS can now connect to the server'
            ],
            debugInfo: debugResults
          });
          toast.success('🎉 DigitalOcean server is online and ready!');
          return;
        } else {
          debugResults.tests.health = {
            status: healthResponse.status,
            success: false,
            statusText: healthResponse.statusText,
            body: await healthResponse.text().catch(() => 'Could not read response')
          };
        }
      } catch (error) {
        debugResults.tests.health = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
      }
      console.log('❌ Health check result:', debugResults.tests.health);

      // Test 3: API health endpoint
      console.log('🧪 Test 3: API health endpoint...');
      try {
        const apiHealthResponse = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        
        if (apiHealthResponse.ok) {
          const apiHealthData = await apiHealthResponse.json();
          debugResults.tests.apiHealth = {
            status: apiHealthResponse.status,
            success: true,
            data: apiHealthData
          };
          console.log('✅ API health check passed:', debugResults.tests.apiHealth);
        } else {
          debugResults.tests.apiHealth = {
            status: apiHealthResponse.status,
            success: false,
            statusText: apiHealthResponse.statusText,
            body: await apiHealthResponse.text().catch(() => 'Could not read response')
          };
        }
      } catch (error) {
        debugResults.tests.apiHealth = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
      }
      console.log('API Health result:', debugResults.tests.apiHealth);

      // Test 4: Root endpoint content
      console.log('🧪 Test 4: Root endpoint content...');
      try {
        const rootResponse = await fetch(baseUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        debugResults.tests.rootContent = {
          status: rootResponse.status,
          success: rootResponse.ok,
          contentType: rootResponse.headers.get('content-type'),
          body: (await rootResponse.text()).substring(0, 200) + '...'
        };
      } catch (error) {
        debugResults.tests.rootContent = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
      }
      console.log('Root content result:', debugResults.tests.rootContent);

      // Analyze results
      const hasBasicConnectivity = debugResults.tests.basicConnectivity?.success;
      const hasHealthEndpoint = debugResults.tests.health?.success;
      const hasApiHealth = debugResults.tests.apiHealth?.success;

      if (hasBasicConnectivity && (hasHealthEndpoint || hasApiHealth)) {
        setServerStatus({
          status: 'online',
          details: 'DigitalOcean app is responding but may have partial functionality',
          nextSteps: [
            '⚠️ App is running but some endpoints may not be working',
            '🔧 Check DigitalOcean app logs for errors',
            '🔧 Verify /server directory configuration',
            '🔧 Check if streaming server started properly'
          ],
          debugInfo: debugResults
        });
      } else if (hasBasicConnectivity) {
        setServerStatus({
          status: 'offline',
          details: 'DigitalOcean app exists but streaming server is not running properly',
          nextSteps: [
            '🚨 App deployed but streaming server failed to start',
            '📋 Check DigitalOcean app logs in your dashboard',
            '🔧 Verify source directory is set to /server',
            '🔧 Check environment variables are configured',
            '🔧 May need to redeploy with correct settings'
          ],
          debugInfo: debugResults
        });
      } else {
        setServerStatus({
          status: 'needs-deployment',
          details: 'DigitalOcean app is not accessible - deployment may have failed',
          nextSteps: [
            '🚨 App is not responding at all',
            '📋 Check DigitalOcean dashboard for deployment status',
            '🔧 Look for build/deployment errors',
            '🔧 Verify GitHub repository connection',
            '🔧 May need to redeploy or fix configuration'
          ],
          debugInfo: debugResults
        });
      }

    } catch (error) {
      console.error('❌ Complete deployment check failed:', error);
      setServerStatus({
        status: 'needs-deployment',
        details: 'Unable to check DigitalOcean deployment status',
        nextSteps: [
          '🚨 Network error or deployment completely failed',
          '📋 Check your internet connection',
          '📋 Check DigitalOcean dashboard for deployment status',
          '🔧 App may need to be redeployed'
        ],
        debugInfo: debugResults
      });
    } finally {
      setChecking(false);
    }
  };

  const deployInstructions = [
    {
      step: 1,
      title: "Check DigitalOcean Dashboard",
      description: "Go to your app dashboard and check deployment status and logs",
      action: "https://cloud.digitalocean.com/apps"
    },
    {
      step: 2,
      title: "Verify Source Directory",
      description: "Ensure source directory is set to '/server' not '/' or empty",
      action: null
    },
    {
      step: 3,
      title: "Check Environment Variables",
      description: "Verify all required environment variables are set correctly",
      action: null
    },
    {
      step: 4,
      title: "Review Build Logs",
      description: "Check the build and runtime logs for any error messages",
      action: null
    }
  ];

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            DigitalOcean Deployment Status
          </h3>
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
            {checking ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
          </Button>
        </div>

        {serverStatus.status !== 'checking' && (
          <Alert className={`${
            serverStatus.status === 'online' 
              ? 'border-green-500/20 bg-green-500/10' 
              : 'border-red-500/20 bg-red-500/10'
          }`}>
            <div className="flex items-start gap-3">
              {serverStatus.status === 'online' ? (
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              )}
              <div>
                <AlertDescription className="text-base font-medium mb-2">
                  {serverStatus.details}
                </AlertDescription>
                <div className="space-y-1">
                  {serverStatus.nextSteps.map((step, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Alert>
        )}

        {/* Enhanced Debug Information */}
        {serverStatus.debugInfo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              <h4 className="font-medium text-blue-400">Detailed Diagnostic Results</h4>
            </div>
            
            <div className="grid gap-4">
              {Object.entries(serverStatus.debugInfo.tests).map(([testName, result]: [string, any]) => (
                <div key={testName} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm capitalize">
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.success 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  
                  <div className="text-xs font-mono text-gray-300 space-y-1">
                    {result.status && <p>Status: {result.status}</p>}
                    {result.error && <p className="text-red-300">Error: {result.error}</p>}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-400">Show Response Data</summary>
                        <pre className="mt-1 p-2 bg-slate-900 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(serverStatus.status === 'needs-deployment' || serverStatus.status === 'offline') && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">🔧 Troubleshooting Steps</h4>
            
            {deployInstructions.map((instruction) => (
              <div key={instruction.step} className="p-4 border border-slate-500/20 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium">
                      Step {instruction.step}: {instruction.title}
                    </h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {instruction.description}
                    </p>
                  </div>
                  {instruction.action && (
                    <Button
                      onClick={() => window.open(instruction.action, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {serverStatus.status === 'online' && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">✅ Deployment Successful!</h4>
            <p className="text-sm text-muted-foreground">
              Your DigitalOcean streaming server is now running and ready for OBS connections.
            </p>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
