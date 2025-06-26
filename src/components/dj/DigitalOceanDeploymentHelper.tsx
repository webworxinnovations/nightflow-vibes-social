
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
  Zap
} from "lucide-react";
import { toast } from "sonner";

export const DigitalOceanDeploymentHelper = () => {
  const [checking, setChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<{
    status: 'checking' | 'online' | 'offline' | 'needs-deployment';
    details: string;
    nextSteps: string[];
  }>({ status: 'checking', details: '', nextSteps: [] });

  const checkDigitalOceanStatus = async () => {
    setChecking(true);
    console.log('🔍 Checking DigitalOcean deployment status...');
    
    try {
      // Test the actual DigitalOcean URL
      const testUrl = 'https://nightflow-app-wijb2.ondigitalocean.app';
      
      const response = await fetch(`${testUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        setServerStatus({
          status: 'online',
          details: 'DigitalOcean app is running and responding',
          nextSteps: [
            'Server is online - streaming should work',
            'Try generating a new stream key',
            'Test OBS connection with the provided URLs'
          ]
        });
        toast.success('✅ DigitalOcean server is online!');
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ DigitalOcean check failed:', error);
      
      // Check if the domain exists at all
      try {
        await fetch('https://nightflow-app-wijb2.ondigitalocean.app', { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        setServerStatus({
          status: 'offline',
          details: 'DigitalOcean app exists but streaming server is not running',
          nextSteps: [
            'The DigitalOcean app needs to be redeployed with streaming server',
            'Server code exists but may not be running properly',
            'Need to check DigitalOcean app logs and configuration'
          ]
        });
      } catch {
        setServerStatus({
          status: 'needs-deployment',
          details: 'DigitalOcean app does not exist or is not deployed',
          nextSteps: [
            'Need to deploy the streaming server to DigitalOcean',
            'Create new DigitalOcean app with server code',
            'Configure environment variables and ports'
          ]
        });
      }
    } finally {
      setChecking(false);
    }
  };

  const deployInstructions = [
    {
      step: 1,
      title: "Create DigitalOcean App",
      description: "Go to DigitalOcean App Platform and create a new app",
      action: "https://cloud.digitalocean.com/apps"
    },
    {
      step: 2,
      title: "Connect GitHub Repository",
      description: "Connect your GitHub repo and set source directory to '/server'",
      action: null
    },
    {
      step: 3,
      title: "Configure Environment Variables",
      description: "Add NODE_ENV=production, RTMP_PORT=1935, HLS_PORT=8080",
      action: null
    },
    {
      step: 4,
      title: "Enable Custom Ports",
      description: "Enable TCP port 1935 for RTMP streaming in app settings",
      action: null
    }
  ];

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            DigitalOcean Streaming Server Setup
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
            {checking ? 'Checking...' : 'Check Server Status'}
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
                      • {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Alert>
        )}

        {serverStatus.status === 'needs-deployment' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">🚀 Deployment Steps</h4>
            
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
            <h4 className="font-medium text-green-400 mb-2">✅ Ready to Stream!</h4>
            <p className="text-sm text-muted-foreground">
              Your DigitalOcean server is running. You can now generate stream keys and connect OBS.
            </p>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
