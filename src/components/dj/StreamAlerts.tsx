
import { AlertTriangle, Info, Shield } from "lucide-react";
import { HttpAccessHelper } from "./HttpAccessHelper";
import { HttpsSetupGuide } from "./HttpsSetupGuide";

interface StreamAlertsProps {
  hasMixedContentIssue: boolean;
}

export const StreamAlerts = ({ hasMixedContentIssue }: StreamAlertsProps) => {
  if (!hasMixedContentIssue) {
    return (
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <p className="text-green-400 font-medium">✅ Connection ready - no mixed content issues</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Mixed Content Alert */}
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
          <div>
            <h4 className="text-red-400 font-semibold text-lg">Mixed Content Security Error</h4>
            <p className="text-red-300 text-sm">
              Your HTTPS app cannot connect to your HTTP droplet server
            </p>
          </div>
        </div>
        
        <div className="text-sm text-red-200 space-y-2">
          <p><strong>Problem:</strong> Browser security blocks HTTP requests from HTTPS pages</p>
          <p><strong>Current Status:</strong> Your droplet server needs HTTPS support</p>
        </div>
      </div>

      {/* Quick Solutions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <h4 className="font-medium text-blue-400">Solution 1: Enable HTTPS (Recommended)</h4>
          </div>
          <p className="text-blue-300 text-sm mb-3">
            Add SSL certificates to your droplet server for secure connections
          </p>
          <HttpsSetupGuide />
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-amber-400" />
            <h4 className="font-medium text-amber-400">Solution 2: Use HTTP Version</h4>
          </div>
          <p className="text-amber-300 text-sm mb-3">
            Temporarily access HTTP version for testing (less secure)
          </p>
          <HttpAccessHelper />
        </div>
      </div>

      {/* Technical Details */}
      <div className="text-xs text-muted-foreground bg-slate-800/50 p-3 rounded">
        <p className="font-medium mb-2">Technical Details:</p>
        <ul className="space-y-1">
          <li>• NightFlow App: <code>https://nightflow-vibes-social.lovable.app</code> (secure)</li>
          <li>• Your Droplet: <code>http://67.205.179.77:3001</code> (insecure)</li>
          <li>• Browser Policy: Blocks mixed HTTP/HTTPS content</li>
          <li>• Solution: Match protocols (both HTTPS) or use HTTP app version</li>
        </ul>
      </div>
    </div>
  );
};
