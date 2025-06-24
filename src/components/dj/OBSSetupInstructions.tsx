
import { AlertTriangle } from "lucide-react";

interface OBSSetupInstructionsProps {
  obsServerUrl: string;
}

export const OBSSetupInstructions = ({ obsServerUrl }: OBSSetupInstructionsProps) => {
  return (
    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-400 mb-2">OBS Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>In OBS: Go to Settings → Stream</li>
            <li>Service: Select "Custom..."</li>
            <li>Server: Copy the "OBS Server URL" below (WITHOUT /live at the end)</li>
            <li>Stream Key: Copy your stream key</li>
            <li>Click "Apply" → "OK" → "Start Streaming"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
