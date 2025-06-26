
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface ServerStatusDisplayProps {
  serverStatus: {
    status: 'checking' | 'online' | 'offline' | 'needs-deployment';
    details: string;
    nextSteps: string[];
    debugInfo?: any;
  };
}

export const ServerStatusDisplay = ({ serverStatus }: ServerStatusDisplayProps) => {
  if (serverStatus.status === 'checking') return null;

  return (
    <Alert className="border-green-500/20 bg-green-500/10">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
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
  );
};
