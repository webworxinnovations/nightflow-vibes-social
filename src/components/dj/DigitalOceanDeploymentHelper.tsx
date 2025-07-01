
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Cloud, AlertTriangle, CheckCircle, XCircle, Loader } from "lucide-react";
import { ServerStatusChecker } from "./ServerStatusChecker";

export const DigitalOceanDeploymentHelper = () => {
  const [serverStatus, setServerStatus] = useState<{
    status: 'checking' | 'online' | 'offline' | 'needs-deployment';
    details: string;
    nextSteps: string[];
    debugInfo?: any;
  }>({ status: 'checking', details: 'Not tested yet', nextSteps: [] });

  const handleStatusUpdate = (status: typeof serverStatus) => {
    setServerStatus(status);
  };

  const getStatusIcon = () => {
    switch (serverStatus.status) {
      case 'online':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'offline':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'needs-deployment':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'checking':
        return <Loader className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (serverStatus.status) {
      case 'online':
        return 'border-green-500/50 bg-green-500/10';
      case 'offline':
        return 'border-red-500/50 bg-red-500/10';
      case 'needs-deployment':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'checking':
        return 'border-blue-500/50 bg-blue-500/10';
      default:
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {getStatusIcon()}
            Your Droplet Streaming Server Status
          </h3>
          <ServerStatusChecker onStatusUpdate={handleStatusUpdate} />
        </div>

        {/* Server Status Display */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Your Droplet Server (67.205.179.77)</h4>
              <div className="text-sm font-medium">
                Running in PowerShell
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {serverStatus.details}
            </p>

            {serverStatus.nextSteps.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Status Details:</h5>
                <ul className="space-y-1 text-sm">
                  {serverStatus.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Expected Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Expected OBS Configuration:</h4>
          <div className="bg-muted/30 p-3 rounded-lg font-mono text-sm space-y-2">
            <div><strong>Service:</strong> Custom</div>
            <div><strong>Server:</strong> rtmp://67.205.179.77:1935/live</div>
            <div><strong>Stream Key:</strong> [Your generated stream key]</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-medium">Quick Actions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <div className="font-medium text-blue-400">If Server is Online:</div>
              <div className="text-muted-foreground">
                Generate stream key and configure OBS with the settings above
              </div>
            </div>
            
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <div className="font-medium text-yellow-400">If Server is Offline:</div>
              <div className="text-muted-foreground">
                Check your PowerShell window and restart the server
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {serverStatus.debugInfo && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <pre className="mt-2 bg-muted/30 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(serverStatus.debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </GlassmorphicCard>
  );
};
