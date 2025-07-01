
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings, ExternalLink, Copy, Globe } from "lucide-react";
import { toast } from "sonner";

interface StreamAlertsProps {
  hasMixedContentIssue: boolean;
}

export const StreamAlerts = ({ hasMixedContentIssue }: StreamAlertsProps) => {
  const handleCopyHttpUrl = () => {
    const currentUrl = window.location.href;
    const httpUrl = currentUrl.replace('https://', 'http://');
    navigator.clipboard.writeText(httpUrl);
    toast.success('HTTP URL copied to clipboard!', {
      description: 'Paste this in a new browser tab to access the HTTP version'
    });
  };

  const handleOpenHttpVersion = () => {
    const currentUrl = window.location.href;
    const httpUrl = currentUrl.replace('https://', 'http://');
    window.open(httpUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* CRITICAL MIXED CONTENT ALERT */}
      <div className="p-4 bg-red-500/20 border-2 border-red-500/50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <p className="text-red-400 font-bold text-lg">🚨 CRITICAL: Mixed Content Security Error</p>
        </div>
        
        <div className="space-y-3 text-sm">
          <p className="text-red-300">
            <strong>Your HTTPS page cannot connect to your HTTP droplet server.</strong> 
            This is a browser security feature that blocks "mixed content" (HTTP content on HTTPS pages).
          </p>
          
          <div className="bg-red-900/30 p-3 rounded border border-red-500/30">
            <p className="text-red-200 font-medium mb-2">🔒 What's happening:</p>
            <ul className="text-red-200 text-xs space-y-1">
              <li>• Your NightFlow app: HTTPS (secure)</li>
              <li>• Your droplet server: HTTP (insecure)</li>
              <li>• Browser blocks: HTTP video, WebSocket, API calls</li>
              <li>• Result: Stream won't load, OBS status unknown</li>
            </ul>
          </div>

          <div className="bg-green-900/30 p-3 rounded border border-green-500/30">
            <p className="text-green-200 font-medium mb-2">✅ IMMEDIATE SOLUTION:</p>
            <p className="text-green-200 text-xs mb-2">
              Access your NightFlow app via HTTP instead of HTTPS to match your droplet:
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleOpenHttpVersion}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Open HTTP Version
              </Button>
              <Button
                onClick={handleCopyHttpUrl}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy HTTP URL
              </Button>
            </div>
          </div>

          <div className="bg-blue-900/30 p-3 rounded border border-blue-500/30">
            <p className="text-blue-200 font-medium mb-2">🔧 PERMANENT SOLUTIONS:</p>
            <ul className="text-blue-200 text-xs space-y-1">
              <li>• Install SSL certificate on your droplet (make it HTTPS)</li>
              <li>• Use Cloudflare proxy to add HTTPS to your droplet</li>
              <li>• Deploy to a platform that provides HTTPS by default</li>
            </ul>
          </div>
        </div>
      </div>

      {/* DROPLET STATUS */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <p className="text-blue-400 font-medium">📡 Your Droplet Server Status</p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>IP:</strong> 67.205.179.77</p>
          <p><strong>RTMP:</strong> rtmp://67.205.179.77:1935/live (for OBS)</p>
          <p><strong>HTTP API:</strong> http://67.205.179.77:3001 (blocked by HTTPS)</p>
          <p><strong>Status:</strong> Running (but blocked by mixed content)</p>
        </div>
      </div>

      {/* OBS STILL WORKS */}
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <p className="text-green-400 font-medium">🎥 OBS Streaming Still Works!</p>
        </div>
        <p className="text-sm text-muted-foreground">
          OBS connects directly to your droplet via RTMP. The mixed content issue only affects the web interface, 
          not OBS streaming itself. Your streams will work once you use the HTTP version of your app.
        </p>
      </div>
    </div>
  );
};
