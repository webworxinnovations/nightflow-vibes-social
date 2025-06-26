
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DeploymentInstructionsProps {
  className?: string;
}

export const DeploymentInstructions = ({ className }: DeploymentInstructionsProps) => {
  const deployInstructions = [
    {
      step: 1,
      title: "Generate Stream Key",
      description: "Go to the OBS Streaming tab and generate your stream key",
      action: null
    },
    {
      step: 2,
      title: "Configure OBS",
      description: "Use rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live as server URL",
      action: null
    },
    {
      step: 3,
      title: "Start Streaming",
      description: "Click Start Streaming in OBS - your server is ready!",
      action: null
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="font-semibold text-lg">🚀 Ready to Stream!</h4>
      
      {deployInstructions.map((instruction) => (
        <div key={instruction.step} className="p-4 border border-green-500/20 rounded-lg bg-green-500/5">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-medium text-green-400">
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
  );
};
