
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Cloud } from "lucide-react";
import { ServerStatusChecker } from "./ServerStatusChecker";
import { ServerStatusDisplay } from "./ServerStatusDisplay";
import { ServerInfoDisplay } from "./ServerInfoDisplay";
import { DeploymentInstructions } from "./DeploymentInstructions";
import { DebugInfoSection } from "./DebugInfoSection";

export const DigitalOceanDeploymentHelper = () => {
  const [serverStatus, setServerStatus] = useState<{
    status: 'checking' | 'online' | 'offline' | 'needs-deployment';
    details: string;
    nextSteps: string[];
    debugInfo?: any;
  }>({ status: 'checking', details: '', nextSteps: [] });

  const handleStatusUpdate = (status: typeof serverStatus) => {
    setServerStatus(status);
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            DigitalOcean Deployment Status
          </h3>
          <ServerStatusChecker onStatusUpdate={handleStatusUpdate} />
        </div>

        <ServerStatusDisplay serverStatus={serverStatus} />

        <ServerInfoDisplay />

        <DeploymentInstructions />

        <DebugInfoSection debugInfo={serverStatus.debugInfo} />
      </div>
    </GlassmorphicCard>
  );
};
