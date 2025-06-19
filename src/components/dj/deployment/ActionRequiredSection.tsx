
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { toast } from "sonner";

interface ActionRequiredSectionProps {
  testSpecificEndpoint: (endpoint: string) => Promise<any>;
}

export const ActionRequiredSection = ({ testSpecificEndpoint }: ActionRequiredSectionProps) => {
  const handleEndpointTest = async (endpoint: string) => {
    const result = await testSpecificEndpoint(endpoint);
    toast.info(`${endpoint}: ${result.status || 'Error'} ${result.ok ? '✅' : '❌'} - Check console`);
  };

  return (
    <div className="bg-orange-500/10 border border-orange-500/20 rounded p-4">
      <h4 className="font-medium text-orange-400 mb-3 flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        Immediate Action Required
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-orange-300 mb-2">1. Check Railway Dashboard:</p>
          <div className="ml-4 space-y-1">
            <p>• Go to <a href="https://railway.app/dashboard" target="_blank" className="text-blue-400 underline">Railway Dashboard</a></p>
            <p>• Find your "nightflow-vibes-social-production" project</p>
            <p>• Check if the service shows "Healthy" or has errors</p>
            <p>• Look for build failures or crash logs</p>
          </div>
        </div>
        
        <div>
          <p className="font-medium text-orange-300 mb-2">2. Common Issues & Solutions:</p>
          <div className="ml-4 space-y-1">
            <p>• <strong>Build Failed:</strong> Check build logs for errors</p>
            <p>• <strong>Port Issues:</strong> Ensure PORT environment variable is set</p>
            <p>• <strong>Crashed:</strong> Check runtime logs for errors</p>
            <p>• <strong>Not Deployed:</strong> Re-deploy from Railway dashboard</p>
          </div>
        </div>
        
        <div>
          <p className="font-medium text-orange-300 mb-2">3. Quick Tests:</p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => handleEndpointTest('/')} variant="outline" size="sm">
              Test Root
            </Button>
            <Button onClick={() => handleEndpointTest('/health')} variant="outline" size="sm">
              Test Health
            </Button>
            <Button onClick={() => handleEndpointTest('/test')} variant="outline" size="sm">
              Test API
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
