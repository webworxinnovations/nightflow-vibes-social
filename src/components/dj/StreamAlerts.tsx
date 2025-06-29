
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings, ExternalLink, Copy } from "lucide-react";
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

  const handleUseLocalStreaming = () => {
    toast.info(
      '🎯 RECOMMENDED SOLUTION:\n\n' +
      '1. Go to "Test Setup" tab above\n' +
      '2. Generate local stream configuration\n' +
      '3. Use the local RTMP server for OBS\n' +
      '4. No external server needed!\n\n' +
      'This works entirely on your local machine.',
      { duration: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* MIXED CONTENT ALERT */}
      {hasMixedContentIssue && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 font-medium">🔒 BROWSER SECURITY BLOCKING EXTERNAL SERVER</p>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Your HTTPS page cannot connect to HTTP servers (like your DigitalOcean droplet). This is normal browser security.
          </p>
          <div className="space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>✅ RECOMMENDED: Use Local Streaming Instead</strong></p>
              <p>• No external servers needed</p>
              <p>• Works entirely in your browser</p>
              <p>• Perfect for testing OBS setup</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUseLocalStreaming}
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Settings className="h-4 w-4" />
                Use Local Streaming Setup
              </Button>
              <Button
                onClick={handleCopyHttpUrl}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy HTTP URL (Advanced)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LOCAL STREAMING RECOMMENDATION */}
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <p className="text-green-400 font-medium">💡 LOCAL STREAMING READY</p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Your app has a built-in local streaming server that works perfectly with OBS - no external setup needed!
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>How to test OBS streaming:</strong></p>
          <p>1. Click "Test Setup" tab above</p>
          <p>2. Generate your stream configuration</p>
          <p>3. Copy the RTMP settings into OBS</p>
          <p>4. Start streaming and see it live!</p>
        </div>
      </div>

      {/* Network Status Alert */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <p className="text-blue-400 font-medium">🎯 Ready for OBS Testing</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Local streaming server is ready. Switch to "Test Setup" to begin OBS configuration.
        </p>
      </div>
    </div>
  );
};
