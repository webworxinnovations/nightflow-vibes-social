
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useServerStatusChecker } from "./ServerStatusChecker";
import { ServerStatusDisplay } from "./ServerStatusDisplay";
import { ActionRequiredSection } from "./ActionRequiredSection";
import { ManualTestSection } from "./ManualTestSection";

export const FrontendConfiguration = () => {
  const { serverStatus, checking, debugInfo, checkServerStatus, testSpecificEndpoint } = useServerStatusChecker();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {serverStatus?.available ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          Railway Deployment Status
        </h3>
        
        <div className="flex gap-2">
          <Button
            onClick={checkServerStatus}
            variant="outline"
            size="sm"
            disabled={checking}
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recheck
          </Button>
          
          <Button
            onClick={() => window.open('https://railway.app/dashboard', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            Railway Dashboard
          </Button>
        </div>
      </div>
      
      <ServerStatusDisplay 
        serverStatus={serverStatus}
        debugInfo={debugInfo}
        checking={checking}
      />
      
      {!checking && !serverStatus?.available && (
        <div className="space-y-4 mt-4">
          <ActionRequiredSection testSpecificEndpoint={testSpecificEndpoint} />
          <ManualTestSection />
        </div>
      )}
    </GlassmorphicCard>
  );
};
