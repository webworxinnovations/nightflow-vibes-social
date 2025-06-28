
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface StreamAlertsProps {
  hasMixedContentIssue: boolean;
}

export const StreamAlerts = ({ hasMixedContentIssue }: StreamAlertsProps) => {
  const handleFixDropletPorts = () => {
    toast.info(
      '🔧 DROPLET FIREWALL FIX NEEDED:\n\n' +
      '1. SSH to droplet: ssh root@67.205.179.77\n' +
      '2. Allow required ports:\n' +
      '   ufw allow 3001\n' +
      '   ufw allow 1935\n' +
      '3. Check firewall: ufw status\n' +
      '4. Restart server: pm2 restart nightflow-streaming\n\n' +
      'Your server is running but ports need to be opened!',
      { duration: 15000 }
    );
  };

  const handleAccessViaHttp = () => {
    const currentUrl = window.location.href;
    const httpUrl = currentUrl.replace('https://', 'http://');
    toast.info(
      `🔓 ACCESS VIA HTTP:\n\n` +
      `Current (HTTPS): ${currentUrl}\n` +
      `Try this instead: ${httpUrl}\n\n` +
      `Click the button below to switch to HTTP version.`,
      { 
        duration: 10000,
        action: {
          label: 'Switch to HTTP',
          onClick: () => window.open(httpUrl, '_blank')
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* MIXED CONTENT ALERT */}
      {hasMixedContentIssue && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 font-medium">🔒 MIXED CONTENT ISSUE DETECTED</p>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Your HTTPS page cannot load HTTP content from your droplet. This is a browser security restriction causing the network errors you're seeing.
          </p>
          <div className="space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Solutions:</strong></p>
              <p>• Access your app via HTTP (recommended for development)</p>
              <p>• Or enable HTTPS on your DigitalOcean droplet server</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAccessViaHttp}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Switch to HTTP Version
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CRITICAL FIREWALL ALERT */}
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <p className="text-red-400 font-medium">🔥 DROPLET FIREWALL ISSUE DETECTED</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Your DigitalOcean droplet server is running (confirmed by pm2), but ports 3001 and 1935 are not accessible from the internet. This is a firewall configuration issue.
        </p>
        <Button
          onClick={handleFixDropletPorts}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Show Firewall Fix Commands
        </Button>
      </div>

      {/* Network Status Alert */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <p className="text-blue-400 font-medium">Network Connection Status</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Server confirmed running via pm2, but network access issues detected.
        </p>
        <p className="text-sm text-muted-foreground">
          SSH command: <code className="bg-slate-700 px-1 rounded">ssh root@67.205.179.77</code>
        </p>
        {hasMixedContentIssue && (
          <p className="text-sm text-red-400 mt-2">
            🔒 Mixed content blocking is preventing HTTP requests from HTTPS page.
          </p>
        )}
      </div>
    </div>
  );
};
