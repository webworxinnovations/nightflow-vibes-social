
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";

interface DeploymentInstructionsProps {
  className?: string;
}

export const DeploymentInstructions = ({ className }: DeploymentInstructionsProps) => {
  const deployInstructions = [
    {
      step: 1,
      title: "RTMP Connection Issue Detected",
      description: "OBS shows 'Hostname not found' - DigitalOcean may not support RTMP port 1935",
      action: null,
      type: "error"
    },
    {
      step: 2,
      title: "Use Browser Streaming Instead",
      description: "Go to Browser Stream tab for direct streaming from your browser",
      action: null,
      type: "solution"
    },
    {
      step: 3,
      title: "Alternative: Deploy to VPS",
      description: "For OBS support, consider deploying to a VPS with full port control",
      action: null,
      type: "alternative"
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        <h4 className="font-semibold text-lg text-amber-400">RTMP Connection Issue</h4>
      </div>
      
      {deployInstructions.map((instruction) => (
        <div 
          key={instruction.step} 
          className={`p-4 border rounded-lg ${
            instruction.type === 'error' 
              ? 'border-red-500/20 bg-red-500/5' 
              : instruction.type === 'solution'
              ? 'border-blue-500/20 bg-blue-500/5'
              : 'border-amber-500/20 bg-amber-500/5'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h5 className={`font-medium ${
                instruction.type === 'error' 
                  ? 'text-red-400' 
                  : instruction.type === 'solution'
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }`}>
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
      
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
        <p className="text-blue-400 font-medium mb-1">💡 Recommended Solution:</p>
        <p className="text-blue-300">
          Switch to the "Browser Stream" tab in the DJ Dashboard for immediate streaming capability without OBS setup issues.
        </p>
      </div>
    </div>
  );
};
