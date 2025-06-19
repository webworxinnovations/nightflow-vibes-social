
import { Globe } from "lucide-react";

export const ManualTestSection = () => {
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
      <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Manual URL Tests
      </h4>
      <div className="text-sm space-y-2">
        <p>Try opening these URLs directly in your browser:</p>
        <div className="space-y-1">
          <a 
            href="https://nightflow-vibes-social-production.up.railway.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline block"
          >
            → https://nightflow-vibes-social-production.up.railway.app/
          </a>
          <a 
            href="https://nightflow-vibes-social-production.up.railway.app/health" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline block"
          >
            → https://nightflow-vibes-social-production.up.railway.app/health
          </a>
          <a 
            href="https://nightflow-vibes-social-production.up.railway.app/test" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline block"
          >
            → https://nightflow-vibes-social-production.up.railway.app/test
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          If these URLs don't load, your Railway deployment has an issue that needs to be fixed.
        </p>
      </div>
    </div>
  );
};
