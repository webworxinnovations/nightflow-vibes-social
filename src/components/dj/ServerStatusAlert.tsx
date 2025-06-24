
import { AlertCircle } from "lucide-react";

interface ServerStatusAlertProps {
  serverAvailable: boolean;
}

export const ServerStatusAlert = ({ serverAvailable }: ServerStatusAlertProps) => {
  if (serverAvailable) return null;

  return (
    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-400 mb-2">Server Issue Detected</h4>
          <p className="text-sm text-muted-foreground">
            The RTMP streaming server is not responding. This is why OBS shows "Failed to connect to server". 
            Use the diagnostics tool below to troubleshoot.
          </p>
        </div>
      </div>
    </div>
  );
};
