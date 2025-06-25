
import { AlertTriangle, CheckCircle } from "lucide-react";

interface OBSSetupInstructionsProps {
  obsServerUrl: string;
}

export const OBSSetupInstructions = ({ obsServerUrl }: OBSSetupInstructionsProps) => {
  return (
    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-400 mb-2">✅ Correct OBS Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>In OBS: Go to Settings → Stream</li>
            <li>Service: Select "Custom..."</li>
            <li>Server: Copy this exact URL → <code className="bg-green-500/20 px-1 rounded text-green-400">{obsServerUrl}</code></li>
            <li>Stream Key: Copy your stream key from below</li>
            <li>Click "Apply" → "OK" → "Start Streaming"</li>
          </ol>
          
          <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
            <div className="flex items-center gap-2 text-blue-400">
              <AlertTriangle className="h-3 w-3" />
              <strong>Important:</strong>
            </div>
            <p className="text-blue-300 mt-1">
              Do NOT include "/live" in the server field - OBS adds this automatically when connecting!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
